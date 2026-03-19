import { Document, Packer, Paragraph, TextRun, Table as DocxTable, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// 创建试卷文档
export const createExamPaperDocument = (paper, knowledgePoints) => {
  const children = [];

  // 试卷标题
  children.push(
    new Paragraph({
      text: paper.title,
      heading: HeadingLevel.TITLE,
      alignment: 'center',
      spacing: { after: 400 }
    })
  );

  // 试卷信息
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `总分：${paper.total_score}分    题目总数：${paper.questions.length}道    考试时间：90分钟`,
          size: 24,
          color: '666666'
        })
      ],
      spacing: { after: 400 }
    })
  );

  // 按题型组织题目
  const questionTypes = ['选择题', '填空题', '简答题', '实验题'];
  let questionNumber = 1;

  questionTypes.forEach(type => {
    const questions = paper.questions.filter(q => q.type === type);
    if (questions.length === 0) return;

    const scorePerQuestion = paper.question_scores?.[type] || 5;
    const totalTypeScore = questions.length * scorePerQuestion;

    // 题型标题
    children.push(
      new Paragraph({
        text: `一、${type}（共${questions.length}题，每题${scorePerQuestion}分，共${totalTypeScore}分）`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    // 题目内容
    questions.forEach((q, index) => {
      // 题号和内容
      const contentParagraph = new Paragraph({
        children: [
          new TextRun({
            text: `${questionNumber}. `,
            bold: true
          }),
          new TextRun({
            text: q.content,
            size: 24
          })
        ],
        spacing: { after: 200 }
      });
      children.push(contentParagraph);

      // 选择题选项
      if (q.type === '选择题' && q.options) {
        let options = q.options;
        if (typeof options === 'string') {
          try {
            options = JSON.parse(options);
          } catch (e) {
            console.error('解析选项失败:', e);
          }
        }

        if (options && typeof options === 'object') {
          Object.entries(options).forEach(([key, value]) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `   ${key}. ${value}`,
                    size: 24
                  })
                ],
                spacing: { after: 100 }
              })
            );
          });
        }
      }

      questionNumber++;
    });
  });

  // 创建文档
  return new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });
};

// 创建答案和解析文档
export const createAnswerKeyDocument = (paper, knowledgePoints) => {
  const children = [];

  // 标题
  children.push(
    new Paragraph({
      text: `${paper.title} - 参考答案与解析`,
      heading: HeadingLevel.TITLE,
      alignment: 'center',
      spacing: { after: 400 }
    })
  );

  // 按题型组织答案
  const questionTypes = ['选择题', '填空题', '简答题', '实验题'];
  let questionNumber = 1;

  questionTypes.forEach(type => {
    const questions = paper.questions.filter(q => q.type === type);
    if (questions.length === 0) return;

    const scorePerQuestion = paper.question_scores?.[type] || 5;

    // 题型标题
    children.push(
      new Paragraph({
        text: `一、${type}（共${questions.length}题，每题${scorePerQuestion}分）`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    // 答案和解析
    questions.forEach((q) => {
      // 题号
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${questionNumber}. ${q.title || type}`,
              bold: true,
              size: 24
            })
          ],
          spacing: { after: 200 }
        })
      );

      // 答案部分
      let answerText = '';
      if (type === '选择题') {
        answerText = `【答案】${q.answer}`;
      } else if (type === '填空题') {
        answerText = `【答案】${q.answer}`;
      } else {
        answerText = `【参考答案】`;
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: answerText,
              color: 'FA8C16',
              bold: true,
              size: 24
            })
          ],
          spacing: { after: type === '简答题' || type === '实验题' ? 0 : 200 }
        })
      );

      // 简答题和实验题的答案内容
      if ((type === '简答题' || type === '实验题') && q.answer) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: q.answer,
                size: 24
              })
            ],
            spacing: { after: 200 }
          })
        );
      }

      // 解析部分
      if (q.analysis) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '【解析】',
                color: '1890FF',
                bold: true,
                size: 24
              }),
              new TextRun({
                text: q.analysis,
                size: 24,
                break: 1 // 换行
              })
            ],
            spacing: { after: 200 }
          })
        );
      }

      // 知识点和难度
      const kp = knowledgePoints.find(k => k.id === parseInt(q.knowledge_point_id));
      const difficultyText = q.difficulty_level === 1 ? '基础' : q.difficulty_level === 2 ? '中等' : '困难';
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `知识点：${kp?.title || '未分类'}    难度：${difficultyText}`,
              size: 20,
              color: '999999'
            })
          ],
          spacing: { after: 300 }
        })
      );

      questionNumber++;
    });
  });

  // 创建文档
  return new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });
};

// 导出试卷
export const exportExamPaper = (paper, knowledgePoints = []) => {
  const doc = createExamPaperDocument(paper, knowledgePoints);
  
  Packer.toBlob(doc).then(blob => {
    const filename = `${paper.title.replace(/[\/\\:*?"<>|]/g, '_')}.docx`;
    saveAs(blob, filename);
  });
};

// 导出答案和解析
export const exportAnswerKey = (paper, knowledgePoints = []) => {
  const doc = createAnswerKeyDocument(paper, knowledgePoints);
  
  Packer.toBlob(doc).then(blob => {
    const filename = `${paper.title.replace(/[\/\\:*?"<>|]/g, '_')}-答案与解析.docx`;
    saveAs(blob, filename);
  });
};

const express = require('express');
const router = express.Router();
const axios = require('axios');

// 配置 AI 接口（根据需要修改）
const AI_CONFIG = {
  // 选项 1: OpenAI GPT
  provider: 'zhipu', // 可选：'openai', 'wenxin', 'zhipu', 'moonshot'
  
  // OpenAI 配置
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
  },
  
  // 百度文心一言配置
  wenxin: {
    apiKey: process.env.WENXIN_API_KEY || 'your-wenxin-api-key',
    secretKey: process.env.WENXIN_SECRET_KEY || 'your-wenxin-secret-key',
    baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1'
  },
  
  // 智谱 AI 配置
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY || '9470482abb7742a99fe9f6bca940a826.cRxmmbDSCKT7YOUT',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4'
  },
  
  // 月之暗面 Kimi 配置
  moonshot: {
    apiKey: process.env.MOONSHOT_API_KEY || 'your-moonshot-api-key',
    baseURL: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k'
  }
};

// 调用 AI 接口的通用函数
async function callAI(prompt, systemPrompt = '你是一个专业的高中生物教学助手') {
  const config = AI_CONFIG[AI_CONFIG.provider];
  
  try {
    if (AI_CONFIG.provider === 'openai') {
      const response = await axios.post(
        `${config.baseURL}/chat/completions`,
        {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.choices[0].message.content;
      
    } else if (AI_CONFIG.provider === 'zhipu') {
      const response = await axios.post(
        `${config.baseURL}/chat/completions`,
        {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.choices[0].message.content;
      
    } else if (AI_CONFIG.provider === 'moonshot') {
      const response = await axios.post(
        `${config.baseURL}/chat/completions`,
        {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.choices[0].message.content;
    }
    
    // 默认返回模拟数据
    return null;
  } catch (error) {
    console.error('AI 调用失败:', error.message);
    return null;
  }
}

// AI 智能问答接口
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const prompt = `请回答这个高中生物教学相关的问题：${message}
${context?.topic ? `主题：${context.topic}` : ''}
请用专业、易懂的语言回答，适合高中生物教学使用。`;

    const aiReply = await callAI(prompt, '你是一个专业的高中生物教学助手，擅长解答生物学科问题。');
    
    if (aiReply) {
      const aiResponse = {
        reply: aiReply,
        suggestions: [
          '能详细解释一下吗？',
          '有没有相关的例子？',
          '这个知识点在考试中常见吗？'
        ],
        relatedKnowledge: [
          { id: 1, title: '相关知识点 1' },
          { id: 2, title: '相关知识点 2' }
        ]
      };
      res.json({ success: true, data: aiResponse });
    } else {
      throw new Error('AI 服务不可用');
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI 智能备课接口
router.post('/generate-lesson-plan', async (req, res) => {
  try {
    const { chapter, grade_level, duration, difficulty, settings } = req.body;
    
    const prompt = `请为高中生物课生成一份完整的教案。

课题：${chapter}
年级：${grade_level}
课时：${duration}分钟
难度：${difficulty === 1 ? '基础' : difficulty === 2 ? '中等' : '提高'}

请生成包含以下内容的详细教案：
1. 教学目标（包括生命观念、科学思维、科学探究、社会责任四个维度）
2. 教学重难点
3. 详细的教学过程（包括导入、新知讲解、课堂活动、总结提升）
4. 板书设计
5. 教学反思

要求：内容专业、详细，符合高中生物课程标准，适合${grade_level}学生。`;

    const aiContent = await callAI(prompt, '你是一个经验丰富的高中生物教师，擅长设计优秀的教学方案。');
    
    if (aiContent) {
      const generatedPlan = {
        title: `${chapter} 教学设计`,
        chapter,
        objectives: `1. 理解${chapter}的核心概念
2. 掌握相关实验技能和科学方法
3. 培养科学思维和探究能力
4. 形成生命观念和社会责任意识`,
        content: aiContent,
        activities: [
          { type: 'discussion', title: '小组讨论：核心概念理解', duration: '10 分钟' },
          { type: 'experiment', title: '实验观察与操作', duration: '20 分钟' },
          { type: 'quiz', title: '随堂测试', duration: '10 分钟' }
        ],
        resources: [
          { type: 'video', title: '教学视频：核心概念讲解', url: '#', duration: '5 分钟' },
          { type: 'animation', title: '3D 动画：微观过程演示', url: '#', duration: '3 分钟' },
          { type: 'experiment', title: '虚拟实验：模拟操作', url: '#', duration: '15 分钟' }
        ],
        settings: settings || {}
      };
      res.json({ success: true, data: generatedPlan });
    } else {
      throw new Error('AI 服务不可用');
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI 智能批改接口
router.post('/grade-answer', async (req, res) => {
  try {
    const { question_id, student_answer, question_type, correct_answer } = req.body;
    
    const prompt = `请批改这道生物题的学生答案。

题目类型：${question_type}
参考答案：${correct_answer}
学生答案：${student_answer}

请：
1. 判断答案是否正确
2. 给出分数（0-100）
3. 提供详细的反馈意见
4. 指出关键得分点和失分点`;

    const aiFeedback = await callAI(prompt, '你是一个公正、细致的高中生物教师，擅长批改学生作业并提供建设性反馈。');
    
    if (aiFeedback) {
      const gradingResult = {
        is_correct: aiFeedback.includes('正确') || aiFeedback.includes('对'),
        score: 85,
        feedback: aiFeedback,
        key_points: [
          '核心概念理解正确',
          '部分细节需要完善',
          '建议加强知识联系'
        ]
      };
      res.json({ success: true, data: gradingResult });
    } else {
      throw new Error('AI 服务不可用');
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 解析 AI 生成的题目
function parseAIQuestions(aiResponse, questionType, difficulty) {
  try {
    // 尝试直接解析 JSON
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (e) {
      // 如果不是 JSON，尝试提取 JSON 部分
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析 AI 响应');
      }
    }
    
    // 如果是数组，直接返回
    if (Array.isArray(parsed)) {
      return parsed.map((q, index) => {
        const qType = q.type || questionType || '选择题';
        // 只有选择题才处理选项
        const hasOptions = qType === '选择题';
        return {
          key: `ai_${index}`,
          title: q.title || `题目 ${index + 1}`,
          type: qType,
          content: q.content || q.question || '',
          options: hasOptions ? {
            A: q.options?.A || q.option_a || q.optionA || '',
            B: q.options?.B || q.option_b || q.optionB || '',
            C: q.options?.C || q.option_c || q.optionC || '',
            D: q.options?.D || q.option_d || q.optionD || ''
          } : undefined,
          answer: q.answer || q.correct_answer || '',
          analysis: q.analysis || q.explanation || q.parse || '',
          difficulty_level: q.difficulty_level || difficulty || 2
        };
      });
    }
    
    // 如果是单个对象
    if (typeof parsed === 'object') {
      const qType = parsed.type || questionType || '选择题';
      const hasOptions = qType === '选择题';
      return [{
        key: 'ai_0',
        title: parsed.title || '题目 1',
        type: qType,
        content: parsed.content || parsed.question || '',
        options: hasOptions ? {
          A: parsed.options?.A || parsed.option_a || parsed.optionA || '',
          B: parsed.options?.B || parsed.option_b || parsed.optionB || '',
          C: parsed.options?.C || parsed.option_c || parsed.optionC || '',
          D: parsed.options?.D || parsed.option_d || parsed.optionD || ''
        } : undefined,
        answer: parsed.answer || parsed.correct_answer || '',
        analysis: parsed.analysis || parsed.explanation || parsed.parse || '',
        difficulty_level: parsed.difficulty_level || difficulty || 2
      }];
    }
    
    throw new Error('解析结果不是有效格式');
  } catch (error) {
    console.error('解析 AI 响应失败:', error);
    return null;
  }
}

// AI 生成题目接口
router.post('/generate-question', async (req, res) => {
  try {
    const { knowledge_point_id, difficulty, question_type, count, knowledge_name } = req.body;
    
    const prompt = `你是一位经验丰富的高中生物命题教师。请生成${count || 1}道高质量的高中生物题目。

【命题要求】
知识点：${knowledge_name || '生物核心概念'}
题型：${question_type || '选择题'}
难度：${difficulty === 1 ? '基础（简单概念题）' : difficulty === 2 ? '中等（综合应用题）' : '困难（分析探究题）'}

【输出格式】
请严格按照以下 JSON 格式输出（不要包含任何解释性文字）：
[
  {
    "title": "题目标题（简短概括）",
    "content": "完整的题干描述",
    "options": {
      "A": "选项 A 内容",
      "B": "选项 B 内容",
      "C": "选项 C 内容",
      "D": "选项 D 内容"
    },
    "answer": "正确答案",
    "analysis": "详细解析"
  }
]

【不同题型的具体要求】
${question_type === '选择题' ? `
- 选择题：
  - content：完整的题干，可以包含"下列哪项正确"等问法
  - options：必须包含 A、B、C、D 四个选项
  - answer：只填字母，如 "A" 或 "B"
  - analysis：解释为什么选这个答案，其他选项为什么错误
` : question_type === '填空题' ? `
- 填空题：
  - content：题干中包含下划线"____"表示填空位置，如"细胞膜的基本支架是____"
  - options：不需要此字段（设为 null 或不包含）
  - answer：填写完整的正确答案，如"磷脂双分子层"
  - analysis：解释答案涉及的知识点的概念和原理
` : question_type === '简答题' ? `
- 简答题：
  - content：明确提出问题，如"简述光合作用的过程和意义"
  - options：不需要此字段（设为 null 或不包含）
  - answer：完整的简答内容，分点作答，条理清晰
  - analysis：说明答题要点和评分标准
` : `
- 实验题：
  - content：描述实验背景、目的或问题，如"设计实验验证..."
  - options：不需要此字段（设为 null 或不包含）
  - answer：完整的实验设计，包括：实验原理、材料用具、方法步骤、预期结果、结论分析
  - analysis：说明实验设计的关键点和考查的能力
`}

【通用命题要求】
1. 题干表述清晰、准确，无歧义
2. 答案正确无误，符合高中生物课程标准
3. 解析详细，说明解题思路和知识点
4. 符合高考命题趋势
5. 难度适中，适合${difficulty === 1 ? '基础薄弱' : difficulty === 2 ? '大多数' : '学有余力'}的学生

现在请生成${count || 1}道${question_type || '选择题'}，直接返回 JSON 数组：`;

    const aiQuestions = await callAI(prompt, '你是一个专业的高中生物命题教师，擅长出高质量、符合高考命题趋势的生物题目。请严格按照 JSON 格式输出题目。');
    
    if (aiQuestions) {
      // 解析 AI 返回的题目
      const parsedQuestions = parseAIQuestions(aiQuestions, question_type, difficulty);
      
      if (parsedQuestions && parsedQuestions.length > 0) {
        res.json({ success: true, data: parsedQuestions });
      } else {
        // 解析失败，返回模拟数据
        console.log('AI 解析失败，使用模拟数据');
        const mockQuestions = Array(count || 1).fill(null).map((_, i) => ({
          key: `ai_${i}`,
          title: `AI 生成的题目 ${i + 1}`,
          type: question_type || '选择题',
          content: `这是一道关于${knowledge_name || '生物知识'}的问题。由于 AI 响应格式解析失败，这是模拟题目。`,
          options: question_type === '选择题' ? {
            A: '选项 A 内容',
            B: '选项 B 内容',
            C: '选项 C 内容',
            D: '选项 D 内容'
          } : undefined,
          answer: question_type === '选择题' ? 'A' : '参考答案',
          analysis: '这道题考查的是相关生物知识点。由于 AI 响应格式解析失败，这是模拟解析。',
          difficulty_level: difficulty || 2
        }));
        res.json({ success: true, data: mockQuestions });
      }
    } else {
      throw new Error('AI 服务不可用');
    }
  } catch (error) {
    console.error('AI 生成题目失败:', error);
    // 返回模拟数据作为降级方案
    const { count, question_type, difficulty, knowledge_name } = req.body;
    const mockQuestions = Array(count || 1).fill(null).map((_, i) => ({
      key: `ai_${i}`,
      title: `AI 生成的题目 ${i + 1}`,
      type: question_type || '选择题',
      content: `这是一道关于${knowledge_name || '生物知识'}的问题。`,
      options: question_type === '选择题' ? {
        A: '选项 A 内容',
        B: '选项 B 内容',
        C: '选项 C 内容',
        D: '选项 D 内容'
      } : undefined,
      answer: question_type === '选择题' ? 'A' : '参考答案',
      analysis: '这道题考查的是相关生物知识点。',
      difficulty_level: difficulty || 2
    }));
    res.json({ success: true, data: mockQuestions });
  }
});

// AI 智能组卷接口
router.post('/generate-paper', async (req, res) => {
  try {
    const { mode, chapters, knowledge_points, question_counts, difficulty_ratio, paper_title, question_scores } = req.body;
    
    const db = require('../db/init.cjs');
    
    // 计算总题数
    const totalQuestions = Object.values(question_counts).reduce((sum, count) => sum + (count || 0), 0);
    
    // 计算各难度题数
    const [easyRatio, mediumRatio, hardRatio] = difficulty_ratio || [5, 3, 2];
    const totalRatio = easyRatio + mediumRatio + hardRatio;
    const easyCount = Math.round(totalQuestions * easyRatio / totalRatio);
    const mediumCount = Math.round(totalQuestions * mediumRatio / totalRatio);
    const hardCount = totalQuestions - easyCount - mediumCount;
    
    console.log('组卷参数:', { mode, chapters, knowledge_points, question_counts, easyCount, mediumCount, hardCount });
    
    // 使用自定义分数或默认分数
    const scores = question_scores || {
      '选择题': 5,
      '填空题': 5,
      '简答题': 10,
      '实验题': 15
    };
    
    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (mode === 'chapter' && chapters.length > 0) {
      // 按章节组卷：查询章节对应的知识点
      const chapterPlaceholders = chapters.map(() => '?').join(',');
      whereClause += ` AND knowledge_point_id IN (
        SELECT id FROM knowledge_points WHERE chapter IN (${chapterPlaceholders})
      )`;
      params.push(...chapters);
    } else if (mode === 'knowledge' && knowledge_points.length > 0) {
      // 按知识点组卷
      const kpPlaceholders = knowledge_points.map(() => '?').join(',');
      whereClause += ` AND knowledge_point_id IN (${kpPlaceholders})`;
      params.push(...knowledge_points);
    }
    
    // 按题型和难度获取题目
    const paperQuestions = [];
    const questionTypes = ['选择题', '填空题', '简答题', '实验题'];
    
    for (const type of questionTypes) {
      const count = question_counts[type] || 0;
      if (count === 0) continue;
      
      // 按难度分配
      const typeEasyCount = Math.round(count * easyRatio / totalRatio);
      const typeMediumCount = Math.round(count * mediumRatio / totalRatio);
      const typeHardCount = count - typeEasyCount - typeMediumCount;
      
      // 获取基础题
      if (typeEasyCount > 0) {
        const query = `SELECT * FROM questions ${whereClause} AND type = ? AND difficulty_level = 1 ORDER BY RANDOM() LIMIT ?`;
        const questions = db.prepare(query).all(...params, type, typeEasyCount);
        paperQuestions.push(...questions);
      }
      
      // 获取中等题
      if (typeMediumCount > 0) {
        const query = `SELECT * FROM questions ${whereClause} AND type = ? AND difficulty_level = 2 ORDER BY RANDOM() LIMIT ?`;
        const questions = db.prepare(query).all(...params, type, typeMediumCount);
        paperQuestions.push(...questions);
      }
      
      // 获取困难题
      if (typeHardCount > 0) {
        const query = `SELECT * FROM questions ${whereClause} AND type = ? AND difficulty_level = 3 ORDER BY RANDOM() LIMIT ?`;
        const questions = db.prepare(query).all(...params, type, typeHardCount);
        paperQuestions.push(...questions);
      }
      
      // 如果题目数量不足，使用 AI 生成补充
      const currentCount = paperQuestions.filter(q => q.type === type).length;
      if (currentCount < count) {
        const needGenerate = count - currentCount;
        console.log(`题目不足，需要 AI 生成${needGenerate}道${type}`);
        
        // 根据不同题型设置不同的 prompt
        let prompt = '';
        if (type === '选择题') {
          prompt = `请生成${needGenerate}道高中生物选择题。
        
知识点范围：${mode === 'chapter' ? '章节：' + chapters.join(', ') : '知识点：' + knowledge_points.join(', ')}
难度分布：基础${typeEasyCount - currentCount > 0 ? typeEasyCount - currentCount : 0}道，中等${typeMediumCount}道，困难${typeHardCount}道

请严格按照 JSON 格式返回：
[
  {
    "title": "题目标题",
    "content": "题干内容",
    "options": {"A": "选项 A", "B": "选项 B", "C": "选项 C", "D": "选项 D"},
    "answer": "正确答案（A/B/C/D）",
    "analysis": "详细解析",
    "difficulty_level": 2
  }
]`;
        } else if (type === '填空题') {
          prompt = `请生成${needGenerate}道高中生物填空题。
        
知识点范围：${mode === 'chapter' ? '章节：' + chapters.join(', ') : '知识点：' + knowledge_points.join(', ')}
难度分布：基础${typeEasyCount - currentCount > 0 ? typeEasyCount - currentCount : 0}道，中等${typeMediumCount}道，困难${typeHardCount}道

请严格按照 JSON 格式返回：
[
  {
    "title": "题目标题",
    "content": "题干内容，用____表示填空位置",
    "answer": "正确答案",
    "analysis": "详细解析",
    "difficulty_level": 2
  }
]`;
        } else if (type === '简答题') {
          prompt = `请生成${needGenerate}道高中生物简答题。
        
知识点范围：${mode === 'chapter' ? '章节：' + chapters.join(', ') : '知识点：' + knowledge_points.join(', ')}
难度分布：基础${typeEasyCount - currentCount > 0 ? typeEasyCount - currentCount : 0}道，中等${typeMediumCount}道，困难${typeHardCount}道

请严格按照 JSON 格式返回：
[
  {
    "title": "题目标题",
    "content": "问题内容",
    "answer": "参考答案要点",
    "analysis": "详细解析",
    "difficulty_level": 2
  }
]`;
        } else if (type === '实验题') {
          prompt = `请生成${needGenerate}道高中生物实验题。
        
知识点范围：${mode === 'chapter' ? '章节：' + chapters.join(', ') : '知识点：' + knowledge_points.join(', ')}
难度分布：基础${typeEasyCount - currentCount > 0 ? typeEasyCount - currentCount : 0}道，中等${typeMediumCount}道，困难${typeHardCount}道

请严格按照 JSON 格式返回：
[
  {
    "title": "实验题目标题",
    "content": "实验背景材料和问题",
    "answer": "参考答案",
    "analysis": "详细解析",
    "difficulty_level": 2
  }
]`;
        }
        
        try {
          const AI_CONFIG = {
            provider: 'zhipu',
            zhipu: {
              apiKey: process.env.ZHIPU_API_KEY || '9470482abb7742a99fe9f6bca940a826.cRxmmbDSCKT7YOUT',
              baseURL: 'https://open.bigmodel.cn/api/paas/v4',
              model: 'glm-4'
            }
          };
          
          const axios = require('axios');
          const config = AI_CONFIG[AI_CONFIG.provider];
          const response = await axios.post(
            `${config.baseURL}/chat/completions`,
            {
              model: config.model,
              messages: [
                { role: 'system', content: '你是一个专业的高中生物命题教师' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7
            },
            {
              headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          const aiContent = response.data.choices[0].message.content;
          let generatedQuestions;
          
          try {
            const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              generatedQuestions = JSON.parse(jsonMatch[0]);
            } else {
              generatedQuestions = JSON.parse(aiContent);
            }
            
            // 添加生成的题目（不保存到数据库，只返回）
            generatedQuestions.forEach((q, i) => {
              paperQuestions.push({
                id: `ai_${type}_${i}`,
                title: q.title,
                type: type,
                content: q.content,
                options: q.options,
                answer: q.answer,
                analysis: q.analysis,
                difficulty_level: q.difficulty_level || 2,
                knowledge_point_id: knowledge_points[0] || null
              });
            });
            
            console.log(`AI 生成了${generatedQuestions.length}道${type}`);
          } catch (e) {
            console.error('AI 题目解析失败:', e);
          }
        } catch (error) {
          console.error('AI 调用失败:', error.message);
        }
      }
    }
    
    // 计算总分
    let totalScore = 0;
    paperQuestions.forEach(q => {
      totalScore += scores[q.type] || 5;
    });
    
    // 构建试卷
    const paper = {
      title: paper_title || '生物测试卷',
      created_at: new Date().toISOString(),
      mode: mode,
      total_questions: paperQuestions.length,
      total_score: totalScore,
      question_scores: scores,
      difficulty_distribution: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount
      },
      questions: paperQuestions.map(q => ({
        id: q.id,
        title: q.title,
        type: q.type,
        content: q.content,
        options: q.options,
        answer: q.answer,
        analysis: q.analysis,
        difficulty_level: q.difficulty_level,
        knowledge_point_id: q.knowledge_point_id
      }))
    };
    
    res.json({ success: true, data: paper });
  } catch (error) {
    console.error('AI 组卷失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

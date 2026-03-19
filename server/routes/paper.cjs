const express = require('express');
const router = express.Router();
const db = require('../db/init.cjs');

// 手动组卷
router.post('/manual', (req, res) => {
  try {
    const { title, question_ids, question_scores } = req.body;
    
    if (!question_ids || question_ids.length === 0) {
      return res.status(400).json({ success: false, error: '请选择题目' });
    }
    
    // 查询选中的题目
    const placeholders = question_ids.map(() => '?').join(',');
    const query = `SELECT * FROM questions WHERE id IN (${placeholders})`;
    const questions = db.prepare(query).all(...question_ids);
    
    // 使用自定义分数或默认分数
    const scores = question_scores || {
      '选择题': 5,
      '填空题': 5,
      '简答题': 10,
      '实验题': 15
    };
    
    // 计算总分
    let totalScore = 0;
    questions.forEach(q => {
      totalScore += scores[q.type] || 5;
    });
    
    // 构建试卷
    const paper = {
      title: title || '生物测试卷',
      created_at: new Date().toISOString(),
      mode: 'manual',
      total_questions: questions.length,
      total_score: totalScore,
      question_scores: scores,
      questions: questions.map(q => ({
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
    console.error('手动组卷失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取试卷列表
router.get('/list', (req, res) => {
  try {
    const papers = db.prepare('SELECT * FROM papers ORDER BY created_at DESC').all();
    res.json({ success: true, data: papers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 保存试卷
router.post('/save', (req, res) => {
  try {
    const { title, questions, mode } = req.body;
    
    const result = db.prepare(`
      INSERT INTO papers (title, questions, mode, created_at)
      VALUES (?, ?, ?, ?)
    `).run(title, JSON.stringify(questions), mode, new Date().toISOString());
    
    res.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

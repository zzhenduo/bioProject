const express = require('express');
const router = express.Router();
const db = require('../db/init.cjs');

// 获取题目列表
router.get('/', (req, res) => {
  try {
    const { knowledge_point_id, difficulty, type, search } = req.query;
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params = [];
    
    if (knowledge_point_id) {
      query += ' AND knowledge_point_id = ?';
      params.push(knowledge_point_id);
    }
    
    if (difficulty) {
      query += ' AND difficulty_level = ?';
      params.push(difficulty);
    }
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }
    
    query += ' ORDER BY id DESC';
    
    const questions = db.prepare(query).all(...params);
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个题目
router.get('/:id', (req, res) => {
  try {
    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建题目
router.post('/', (req, res) => {
  try {
    const { title, type, content, options, answer, analysis, knowledge_point_id, difficulty_level, tags } = req.body;
    const result = db.prepare(`
      INSERT INTO questions (title, type, content, options, answer, analysis, knowledge_point_id, difficulty_level, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, type, content, options, answer, analysis, knowledge_point_id, difficulty_level, tags);
    
    res.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新题目
router.put('/:id', (req, res) => {
  try {
    const { title, type, content, options, answer, analysis, knowledge_point_id, difficulty_level, tags } = req.body;
    db.prepare(`
      UPDATE questions 
      SET title = ?, type = ?, content = ?, options = ?, answer = ?, analysis = ?, 
          knowledge_point_id = ?, difficulty_level = ?, tags = ?
      WHERE id = ?
    `).run(title, type, content, options, answer, analysis, knowledge_point_id, difficulty_level, tags, req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除题目
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

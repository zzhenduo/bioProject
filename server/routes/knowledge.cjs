const express = require('express');
const router = express.Router();
const db = require('../db/init.cjs');

// 获取所有知识点
router.get('/', (req, res) => {
  try {
    const { grade, chapter } = req.query;
    let query = 'SELECT * FROM knowledge_points WHERE 1=1';
    const params = [];
    
    if (grade) {
      query += ' AND grade_level = ?';
      params.push(grade);
    }
    
    if (chapter) {
      query += ' AND chapter = ?';
      params.push(chapter);
    }
    
    query += ' ORDER BY id';
    
    const knowledgePoints = db.prepare(query).all(...params);
    res.json({ success: true, data: knowledgePoints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个知识点
router.get('/:id', (req, res) => {
  try {
    const knowledgePoint = db.prepare('SELECT * FROM knowledge_points WHERE id = ?').get(req.params.id);
    if (!knowledgePoint) {
      return res.status(404).json({ success: false, error: '知识点不存在' });
    }
    res.json({ success: true, data: knowledgePoint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建知识点
router.post('/', (req, res) => {
  try {
    const { title, chapter, grade_level, content, difficulty_level, tags } = req.body;
    const result = db.prepare(`
      INSERT INTO knowledge_points (title, chapter, grade_level, content, difficulty_level, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, chapter, grade_level, content, difficulty_level, tags);
    
    res.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新知识点
router.put('/:id', (req, res) => {
  try {
    const { title, chapter, grade_level, content, difficulty_level, tags } = req.body;
    db.prepare(`
      UPDATE knowledge_points 
      SET title = ?, chapter = ?, grade_level = ?, content = ?, difficulty_level = ?, tags = ?
      WHERE id = ?
    `).run(title, chapter, grade_level, content, difficulty_level, tags, req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除知识点
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM knowledge_points WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

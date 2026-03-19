const express = require('express');
const router = express.Router();
const db = require('../db/init.cjs');

// 获取实验列表
router.get('/', (req, res) => {
  try {
    const { grade_level, knowledge_point_id } = req.query;
    let query = 'SELECT * FROM experiments WHERE 1=1';
    const params = [];
    
    if (grade_level) {
      query += ' AND grade_level = ?';
      params.push(grade_level);
    }
    
    if (knowledge_point_id) {
      query += ' AND knowledge_point_id = ?';
      params.push(knowledge_point_id);
    }
    
    query += ' ORDER BY id';
    
    const experiments = db.prepare(query).all(...params);
    res.json({ success: true, data: experiments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个实验详情
router.get('/:id', (req, res) => {
  try {
    const experiment = db.prepare('SELECT * FROM experiments WHERE id = ?').get(req.params.id);
    if (!experiment) {
      return res.status(404).json({ success: false, error: '实验不存在' });
    }
    res.json({ success: true, data: experiment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建实验
router.post('/', (req, res) => {
  try {
    const { title, description, steps, materials, safety_notes, expected_results, knowledge_point_id, grade_level } = req.body;
    const result = db.prepare(`
      INSERT INTO experiments (title, description, steps, materials, safety_notes, expected_results, knowledge_point_id, grade_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, steps, materials, safety_notes, expected_results, knowledge_point_id, grade_level);
    
    res.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新实验
router.put('/:id', (req, res) => {
  try {
    const { title, description, steps, materials, safety_notes, expected_results, knowledge_point_id, grade_level } = req.body;
    db.prepare(`
      UPDATE experiments 
      SET title = ?, description = ?, steps = ?, materials = ?, safety_notes = ?, 
          expected_results = ?, knowledge_point_id = ?, grade_level = ?
      WHERE id = ?
    `).run(title, description, steps, materials, safety_notes, expected_results, knowledge_point_id, grade_level, req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除实验
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM experiments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db/init.cjs');

// 获取教案列表
router.get('/', (req, res) => {
  try {
    const { teacher_id, chapter } = req.query;
    let query = 'SELECT * FROM lesson_plans WHERE 1=1';
    const params = [];
    
    if (teacher_id) {
      query += ' AND teacher_id = ?';
      params.push(teacher_id);
    }
    
    if (chapter) {
      query += ' AND chapter = ?';
      params.push(chapter);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const lessonPlans = db.prepare(query).all(...params);
    res.json({ success: true, data: lessonPlans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个教案
router.get('/:id', (req, res) => {
  try {
    const lessonPlan = db.prepare('SELECT * FROM lesson_plans WHERE id = ?').get(req.params.id);
    if (!lessonPlan) {
      return res.status(404).json({ success: false, error: '教案不存在' });
    }
    res.json({ success: true, data: lessonPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建教案
router.post('/', (req, res) => {
  try {
    const { title, teacher_id, chapter, objectives, content, activities, resources, settings, ai_generated } = req.body;
    const result = db.prepare(`
      INSERT INTO lesson_plans (title, teacher_id, chapter, objectives, content, activities, resources, settings, ai_generated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, teacher_id, chapter, objectives, content, activities, resources, settings, ai_generated || 0);
    
    res.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新教案
router.put('/:id', (req, res) => {
  try {
    const { title, chapter, objectives, content, activities, resources, settings } = req.body;
    db.prepare(`
      UPDATE lesson_plans 
      SET title = ?, chapter = ?, objectives = ?, content = ?, activities = ?, resources = ?, settings = ?
      WHERE id = ?
    `).run(title, chapter, objectives, content, activities, resources, settings, req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除教案
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM lesson_plans WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

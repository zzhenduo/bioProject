const express = require('express');
const router = express.Router();
const db = require('../db/init.cjs');

// 获取当前用户信息
router.get('/profile', (req, res) => {
  try {
    const { userId } = req.query;
    // 默认返回第一个用户
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId || 1);
    
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新用户信息
router.put('/profile', (req, res) => {
  try {
    const { userId, name, email, phone, school, avatar } = req.body;
    
    db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, school = ?, avatar = ?
      WHERE id = ?
    `).run(name, email, phone, school, avatar, userId || 1);
    
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId || 1);
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取所有用户（用于切换用户）
router.get('/list', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, avatar, school FROM users').all();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 切换当前用户
router.post('/switch', (req, res) => {
  try {
    const { userId } = req.body;
    const user = db.prepare('SELECT id, name, avatar, school FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

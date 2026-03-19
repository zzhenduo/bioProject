const express = require('express');
const router = express.Router();
const db = require('../db/init.cjs');

// 获取教学统计数据
router.get('/overview', (req, res) => {
  try {
    const { teacher_id, date_range } = req.query;
    
    // 模拟统计数据
    const stats = {
      totalLessons: 15,
      totalStudents: 120,
      averageScore: 78.5,
      completionRate: 85.2,
      recentActivity: [
        { date: '2024-01-15', lessons: 3, students: 45 },
        { date: '2024-01-16', lessons: 2, students: 38 },
        { date: '2024-01-17', lessons: 4, students: 52 },
        { date: '2024-01-18', lessons: 3, students: 41 },
        { date: '2024-01-19', lessons: 3, students: 48 }
      ],
      knowledgeDistribution: [
        { name: '细胞的结构', value: 25 },
        { name: '遗传与进化', value: 30 },
        { name: '光合作用', value: 20 },
        { name: '生态系统', value: 15 },
        { name: '其他', value: 10 }
      ],
      experimentUsage: [
        { name: '有丝分裂观察', usage: 45 },
        { name: '色素提取分离', usage: 38 },
        { name: 'DNA 粗提取', usage: 25 }
      ]
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取学生答题统计
router.get('/student-performance', (req, res) => {
  try {
    const { class_id, knowledge_point_id } = req.query;
    
    const performance = {
      averageAccuracy: 72.5,
      difficultyAnalysis: [
        { level: 1, accuracy: 95.2 },
        { level: 2, accuracy: 78.5 },
        { level: 3, accuracy: 65.8 }
      ],
      weakPoints: [
        { knowledge: 'DNA 复制', errorRate: 45.2 },
        { knowledge: '有丝分裂', errorRate: 38.5 }
      ]
    };
    
    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 记录教学行为
router.post('/log', (req, res) => {
  try {
    const { teacher_id, stat_type, stat_data } = req.body;
    
    const result = db.prepare(`
      INSERT INTO teaching_stats (teacher_id, stat_type, stat_data, date)
      VALUES (?, ?, ?, date('now'))
    `).run(teacher_id, stat_type, JSON.stringify(stat_data));
    
    res.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

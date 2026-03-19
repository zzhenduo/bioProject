const db = require('../db/init');

const points = db.prepare('SELECT * FROM knowledge_points ORDER BY id').all();

console.log('数据库中的知识点总数:', points.length);
console.log('\n前 10 个知识点:');
points.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. ${p.title} (${p.chapter}) - 难度：${p.difficulty_level}`);
});

console.log('\n按章节统计:');
const stats = {};
points.forEach(p => {
  if (!stats[p.chapter]) {
    stats[p.chapter] = 0;
  }
  stats[p.chapter]++;
});

Object.keys(stats).sort().forEach(chapter => {
  console.log(`${chapter}: ${stats[chapter]} 个知识点`);
});

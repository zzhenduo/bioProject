console.log('========================================');
console.log('数据库模块初始化');
console.log('========================================');

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('模块环境信息：');
console.log('  __dirname:', __dirname);
console.log('  process.cwd():', process.cwd());
console.log('  process.resourcesPath:', process.resourcesPath || 'undefined');

// 判断是否为生产环境（打包后）
const isProd = !!process.resourcesPath;
console.log('  是否为生产环境:', isProd);

// 数据库路径：生产环境使用 extraResources 中的数据库，开发环境使用本地数据库
let dbPath;
const possiblePaths = [];

if (isProd) {
  // 生产环境可能的路径
  possiblePaths.push(path.join(process.resourcesPath, 'server', 'bio_teaching.db'));
  possiblePaths.push(path.join(process.resourcesPath, 'bio_teaching.db'));
  possiblePaths.push(path.join(process.cwd(), 'server', 'bio_teaching.db'));
  possiblePaths.push(path.join(process.cwd(), 'bio_teaching.db'));
} else {
  // 开发环境可能的路径
  possiblePaths.push(path.join(__dirname, '../bio_teaching.db'));
  possiblePaths.push(path.join(__dirname, 'bio_teaching.db'));
  possiblePaths.push(path.join(process.cwd(), 'server', 'bio_teaching.db'));
  possiblePaths.push(path.join(process.cwd(), 'bio_teaching.db'));
}

console.log('========================================');
console.log('尝试的数据库路径：');
for (let i = 0; i < possiblePaths.length; i++) {
  const p = possiblePaths[i];
  const exists = fs.existsSync(p);
  console.log(`  ${i + 1}. ${p} - ${exists ? '✅ 存在' : '❌ 不存在'}`);
  if (exists && !dbPath) {
    dbPath = p;
  }
}

console.log('========================================');

// 检查是否找到数据库文件
if (!dbPath) {
  console.error('❌ 未找到数据库文件！');
  console.error('  尝试的所有路径：');
  possiblePaths.forEach((p, i) => {
    console.error(`    ${i + 1}. ${p}`);
  });
  
  // 尝试列出目录内容帮助调试
  console.error('========================================');
  console.error('列出目录内容：');
  try {
    if (process.resourcesPath && fs.existsSync(process.resourcesPath)) {
      console.error('  resourcesPath 内容:', fs.readdirSync(process.resourcesPath));
    }
  } catch (e) {
    console.error('  ❌ 无法列出 resourcesPath:', e);
  }
  
  try {
    const serverDir = isProd 
      ? (process.resourcesPath ? path.join(process.resourcesPath, 'server') : null)
      : path.join(__dirname, '..');
    if (serverDir && fs.existsSync(serverDir)) {
      console.error('  server 目录内容:', fs.readdirSync(serverDir));
    }
  } catch (e) {
    console.error('  ❌ 无法列出 server 目录:', e);
  }
  
  throw new Error('数据库文件不存在，所有尝试的路径都未找到文件');
}

console.log('✅ 使用数据库:', dbPath);
console.log('========================================');

// 尝试打开数据库
let db;
try {
  db = new Database(dbPath);
  console.log('✅ 数据库连接成功');
  
  // 测试查询
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📊 数据库表:', tables.map(t => t.name));
} catch (error) {
  console.error('❌ 数据库连接失败:', error);
  throw error;
}

console.log('========================================');

// 不自动创建表，直接使用现有数据库

module.exports = db;

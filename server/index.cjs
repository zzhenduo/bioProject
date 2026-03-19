console.log('========================================');
console.log('后端服务器启动中...');
console.log('========================================');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

console.log('环境信息：');
console.log('  PORT:', PORT);
console.log('  __dirname:', __dirname);
console.log('  process.cwd():', process.cwd());
console.log('  process.resourcesPath:', process.resourcesPath || 'undefined');
console.log('  Node 版本:', process.version);

// 检查数据库初始化模块
console.log('========================================');
console.log('正在加载数据库模块...');
try {
  const dbInitPath = path.join(__dirname, 'db', 'init.cjs');
  console.log('  数据库模块路径:', dbInitPath);
  console.log('  数据库模块存在:', fs.existsSync(dbInitPath));
  if (fs.existsSync(dbInitPath)) {
    const db = require('./db/init.cjs');
    console.log('  ✅ 数据库模块加载成功');
  }
} catch (error) {
  console.error('  ❌ 数据库模块加载失败:', error);
}

console.log('========================================');

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`📥 [请求: ${req.method} ${req.url}`);
  next();
});

// 导入路由
console.log('正在加载路由模块...');
const knowledgeRoutes = require('./routes/knowledge.cjs');
const questionRoutes = require('./routes/question.cjs');
const paperRoutes = require('./routes/paper.cjs');
const experimentRoutes = require('./routes/experiment.cjs');
const lessonPlanRoutes = require('./routes/lessonPlan.cjs');
const aiRoutes = require('./routes/ai.cjs');
const statsRoutes = require('./routes/stats.cjs');
const userRoutes = require('./routes/user.cjs');
console.log('✅ 路由模块加载成功');

// API 路由
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/paper', paperRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  console.log('✅ 健康检查请求');
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// 静态文件服务（生产环境）
const distPath = path.join(__dirname, '../dist');
console.log('========================================');
console.log('静态文件路径:', distPath);
console.log('dist 目录存在:', fs.existsSync(distPath));
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ 静态文件服务已启用');
}

// 生产环境：所有非 API 请求返回 index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  console.log('📄 非API请求，返回:', indexPath);
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: '文件不存在', path: indexPath });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message,
    stack: err.stack 
  });
});

// 启动服务器
console.log('========================================');
console.log('正在启动服务器...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('✅ 深究·生命 后端服务已启动');
  console.log('   本地访问：http://localhost:' + PORT);
  console.log('   当前工作目录：' + process.cwd());
  console.log('   服务器文件路径：' + __dirname);
  console.log('========================================');
  
  // 检查 server 目录内容
  try {
    console.log('   server 目录内容:', fs.readdirSync(__dirname));
  } catch (e) {
    console.error('   ❌ 无法读取 server 目录:', e);
  }
  console.log('========================================');
});

server.on('error', (err) => {
  console.error('❌ 服务器启动失败:', err);
  if (err.code === 'EADDRINUSE') {
    console.error('   端口 ' + PORT + ' 已被占用');
  }
  process.exit(1);
});

server.on('listening', () => {
  console.log('✅ 服务器正在监听...');
});

process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
});

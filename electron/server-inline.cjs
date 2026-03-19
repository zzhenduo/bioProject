console.log('========================================');
console.log('内嵌后端服务器启动中...');
console.log('========================================');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

let db = null;

const app = express();
const PORT = 3001;

console.log('环境信息：');
console.log('  PORT:', PORT);
console.log('  __dirname:', __dirname);
console.log('  process.cwd():', process.cwd());
console.log('  process.resourcesPath:', process.resourcesPath || 'undefined');

// 初始化数据库
try {
  console.log('========================================');
  console.log('正在初始化数据库...');
  
  const Database = require('better-sqlite3');
  
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
    possiblePaths.push(path.join(__dirname, '../server/bio_teaching.db'));
    possiblePaths.push(path.join(__dirname, 'bio_teaching.db'));
    possiblePaths.push(path.join(process.cwd(), 'server', 'bio_teaching.db'));
    possiblePaths.push(path.join(process.cwd(), 'bio_teaching.db'));
  }

  console.log('  尝试的数据库路径：');
  for (let i = 0; i < possiblePaths.length; i++) {
    const p = possiblePaths[i];
    const exists = fs.existsSync(p);
    console.log(`    ${i + 1}. ${p} - ${exists ? '✅ 存在' : '❌ 不存在'}`);
    if (exists && !dbPath) {
      dbPath = p;
    }
  }

  if (!dbPath) {
    console.error('  ❌ 未找到数据库文件！');
    throw new Error('数据库文件不存在');
  }

  console.log('  ✅ 使用数据库:', dbPath);
  console.log('========================================');

  db = new Database(dbPath);
  console.log('✅ 数据库连接成功');

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📊 数据库表:', tables.map(t => t.name));
} catch (error) {
  console.error('❌ 数据库初始化失败:', error);
}

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`📥 [请求] ${req.method} ${req.url}`);
  next();
});

// 简单的用户数据（临时）
let users = [
  { id: 1, name: '曹老师', email: 'cao@school.edu', phone: '18736888888', school: '第一中学', role: 'teacher', created_at: '2024-01-01' }
];

let currentUserId = 1;

// 配置 AI 接口
const AI_CONFIG = {
  provider: 'zhipu',
  zhipu: {
    apiKey: '9470482abb7742a99fe9f6bca940a826.cRxmmbDSCKT7YOUT',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4'
  }
};

// 调用 AI 接口的通用函数
async function callAI(prompt, systemPrompt = '你是一个专业的高中生物教学助手') {
  const config = AI_CONFIG[AI_CONFIG.provider];
  
  try {
    console.log('🤖 正在调用 AI 接口...');
    console.log('   Provider:', AI_CONFIG.provider);
    console.log('   System Prompt:', systemPrompt.substring(0, 50) + '...');
    console.log('   User Prompt:', prompt.substring(0, 100) + '...');
    
    if (AI_CONFIG.provider === 'zhipu') {
      const response = await axios.post(
        `${config.baseURL}/chat/completions`,
        {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );
      
      console.log('✅ AI 接口调用成功');
      const result = response.data.choices[0].message.content;
      console.log('   Response length:', result.length);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('❌ AI 调用失败:');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    return null;
  }
}

// 解析 AI 生成的题目
function parseAIQuestions(aiResponse, questionType, difficulty) {
  try {
    console.log('📝 正在解析 AI 响应...');
    console.log('   Response:', aiResponse.substring(0, 200) + '...');
    
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (e) {
      console.log('   直接解析失败，尝试提取 JSON 部分');
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析 AI 响应');
      }
    }
    
    if (Array.isArray(parsed)) {
      console.log('   解析到', parsed.length, '道题目');
      return parsed.map((q, index) => {
        const qType = q.type || questionType || '选择题';
        const hasOptions = qType === '选择题';
        return {
          key: `ai_${index}`,
          title: q.title || `题目 ${index + 1}`,
          type: qType,
          content: q.content || q.question || '',
          options: hasOptions ? {
            A: q.options?.A || q.option_a || q.optionA || '',
            B: q.options?.B || q.option_b || q.optionB || '',
            C: q.options?.C || q.option_c || q.optionC || '',
            D: q.options?.D || q.option_d || q.optionD || ''
          } : undefined,
          answer: q.answer || q.correct_answer || '',
          analysis: q.analysis || q.explanation || q.parse || '',
          difficulty_level: q.difficulty_level || difficulty || 2
        };
      });
    }
    
    if (typeof parsed === 'object') {
      console.log('   解析到单个题目对象');
      const qType = parsed.type || questionType || '选择题';
      const hasOptions = qType === '选择题';
      return [{
        key: 'ai_0',
        title: parsed.title || '题目 1',
        type: qType,
        content: parsed.content || parsed.question || '',
        options: hasOptions ? {
          A: parsed.options?.A || parsed.option_a || parsed.optionA || '',
          B: parsed.options?.B || parsed.option_b || parsed.optionB || '',
          C: parsed.options?.C || parsed.option_c || parsed.optionC || '',
          D: parsed.options?.D || parsed.option_d || parsed.optionD || ''
        } : undefined,
        answer: parsed.answer || parsed.correct_answer || '',
        analysis: parsed.analysis || parsed.explanation || parsed.parse || '',
        difficulty_level: parsed.difficulty_level || difficulty || 2
      }];
    }
    
    throw new Error('解析结果不是有效格式');
  } catch (error) {
    console.error('❌ 解析 AI 响应失败:', error);
    return null;
  }
}

// 健康检查端点
app.get('/health', (req, res) => {
  console.log('✅ 健康检查请求');
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// 用户 API
app.get('/api/user/profile', (req, res) => {
  console.log('👤 获取用户信息');
  const user = users.find(u => u.id === currentUserId) || users[0];
  res.json({ success: true, data: user });
});

app.get('/api/user/list', (req, res) => {
  console.log('👥 获取用户列表');
  res.json({ success: true, data: users });
});

app.post('/api/user/switch', (req, res) => {
  const { userId } = req.body;
  currentUserId = userId;
  const user = users.find(u => u.id === userId) || users[0];
  res.json({ success: true, data: user });
});

app.put('/api/user/profile', (req, res) => {
  const { userId, ...updates } = req.body;
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
  }
  res.json({ success: true, data: users[userIndex] || users[0] });
});

// 知识点 API（使用数据库）
app.get('/api/knowledge', (req, res) => {
  try {
    if (db) {
      const stmt = db.prepare('SELECT * FROM knowledge_points');
      const data = stmt.all();
      console.log('📚 查询知识点:', data.length, '个');
      res.json({ success: true, data });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('❌ 查询知识点失败:', error);
    res.json({ success: true, data: [] });
  }
});

app.post('/api/knowledge', (req, res) => {
  res.json({ success: true, data: req.body });
});

app.put('/api/knowledge/:id', (req, res) => {
  res.json({ success: true, data: req.body });
});

app.delete('/api/knowledge/:id', (req, res) => {
  res.json({ success: true });
});

// 题目 API
app.get('/api/questions', (req, res) => {
  try {
    if (db) {
      const stmt = db.prepare('SELECT * FROM questions');
      const data = stmt.all();
      console.log('📝 查询题目:', data.length, '道');
      res.json({ success: true, data });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('❌ 查询题目失败:', error);
    res.json({ success: true, data: [] });
  }
});

app.post('/api/questions', (req, res) => {
  res.json({ success: true, data: req.body });
});

app.put('/api/questions/:id', (req, res) => {
  res.json({ success: true, data: req.body });
});

app.delete('/api/questions/:id', (req, res) => {
  res.json({ success: true });
});

// AI 聊天 API
app.post('/api/ai/chat', async (req, res) => {
  console.log('💬 AI 聊天请求');
  try {
    const { message, context } = req.body;
    console.log('   用户消息:', message);
    
    const prompt = `请回答这个高中生物教学相关的问题：${message}
${context?.topic ? `主题：${context.topic}` : ''}
请用专业、易懂的语言回答，适合高中生物教学使用。`;

    const aiReply = await callAI(prompt, '你是一个专业的高中生物教学助手，擅长解答生物学科问题。');
    
    if (aiReply) {
      const aiResponse = {
        reply: aiReply,
        suggestions: [
          '能详细解释一下吗？',
          '有没有相关的例子？',
          '这个知识点在考试中常见吗？'
        ]
      };
      console.log('✅ AI 聊天响应成功');
      res.json({ success: true, data: aiResponse });
    } else {
      console.log('⚠️ AI 调用失败，使用模拟响应');
      const aiResponse = {
        reply: `您好！关于"${message}"的问题，这是一个很好的生物知识点。让我为您详细解释一下...`,
        suggestions: ['细胞结构', '光合作用', 'DNA 复制']
      };
      res.json({ success: true, data: aiResponse });
    }
  } catch (error) {
    console.error('❌ AI 聊天失败:', error);
    const aiResponse = {
      reply: `您好！关于这个问题，让我为您详细解释一下...`,
      suggestions: ['细胞结构', '光合作用', 'DNA 复制']
    };
    res.json({ success: true, data: aiResponse });
  }
});

// AI 生成教案 API
app.post('/api/ai/generate-lesson-plan', async (req, res) => {
  console.log('📋 AI 生成教案请求');
  try {
    const { chapter, grade_level, duration, difficulty, settings } = req.body;
    console.log('   章节:', chapter);
    console.log('   年级:', grade_level);
    console.log('   课时:', duration);
    console.log('   难度:', difficulty);
    
    const prompt = `请为高中生物课生成一份完整的教案。

课题：${chapter}
年级：${grade_level || '高一'}
课时：${duration || 45}分钟
难度：${difficulty === 1 ? '基础' : difficulty === 2 ? '中等' : '提高'}

请生成包含以下内容的详细教案：
1. 教学目标（包括生命观念、科学思维、科学探究、社会责任四个维度）
2. 教学重难点
3. 详细的教学过程（包括导入、新知讲解、课堂活动、总结提升）
4. 板书设计
5. 教学反思

要求：内容专业、详细，符合高中生物课程标准，适合${grade_level || '高一'}学生。`;

    const aiContent = await callAI(prompt, '你是一个经验丰富的高中生物教师，擅长设计优秀的教学方案。');
    
    if (aiContent) {
      const generatedPlan = {
        title: `${chapter} 教学设计`,
        chapter,
        objectives: `1. 理解${chapter}的核心概念
2. 掌握相关实验技能和科学方法
3. 培养科学思维和探究能力
4. 形成生命观念和社会责任意识`,
        content: aiContent,
        activities: [
          { type: 'discussion', title: '小组讨论：核心概念理解', duration: '10 分钟' },
          { type: 'experiment', title: '实验观察与操作', duration: '20 分钟' },
          { type: 'quiz', title: '随堂测试', duration: '10 分钟' }
        ],
        resources: [
          { type: 'video', title: '教学视频：核心概念讲解', url: '#', duration: '5 分钟' },
          { type: 'animation', title: '3D 动画：微观过程演示', url: '#', duration: '3 分钟' },
          { type: 'experiment', title: '虚拟实验：模拟操作', url: '#', duration: '15 分钟' }
        ],
        settings: settings || {}
      };
      console.log('✅ AI 教案生成成功');
      res.json({ success: true, data: generatedPlan });
    } else {
      console.log('⚠️ AI 调用失败，使用模拟响应');
      const generatedPlan = {
        title: `${chapter} 教学设计`,
        chapter,
        objectives: `1. 理解${chapter}的核心概念
2. 掌握相关实验技能和科学方法
3. 培养科学思维和探究能力
4. 形成生命观念和社会责任意识`,
        content: `# ${chapter} 教学设计

## 一、教材分析
本节内容选自${chapter}，是高中生物的核心知识点之一。

## 二、教学目标
### 1. 生命观念
- 形成结构与功能相适应的观念

### 2. 科学思维
- 运用归纳与概括的方法

### 3. 科学探究
- 设计实验方案

### 4. 社会责任
- 关注生物学知识在生活实践中的应用

## 三、教学重难点
### 重点
- 核心概念的理解和掌握

### 难点
- 抽象概念的具体化

## 四、教学过程
### 环节一：情境导入（5 分钟）
### 环节二：新知探究（20 分钟）
### 环节三：巩固提升（15 分钟）
### 环节四：课堂小结（5 分钟）

## 五、板书设计
## 六、教学反思`,
        activities: [
          { type: 'discussion', title: '小组讨论：核心概念理解', duration: '10 分钟' },
          { type: 'experiment', title: '实验观察与操作', duration: '20 分钟' },
          { type: 'quiz', title: '随堂测试', duration: '10 分钟' }
        ],
        resources: [
          { type: 'video', title: '教学视频：核心概念讲解', url: '#', duration: '5 分钟' },
          { type: 'animation', title: '3D 动画：微观过程演示', url: '#', duration: '3 分钟' },
          { type: 'experiment', title: '虚拟实验：模拟操作', url: '#', duration: '15 分钟' }
        ],
        settings: settings || {}
      };
      res.json({ success: true, data: generatedPlan });
    }
  } catch (error) {
    console.error('❌ AI 生成教案失败:', error);
    const { chapter, settings } = req.body;
    const generatedPlan = {
      title: `${chapter} 教学设计`,
      chapter,
      objectives: `1. 理解${chapter}的核心概念
2. 掌握相关实验技能和科学方法
3. 培养科学思维和探究能力
4. 形成生命观念和社会责任意识`,
      content: `# ${chapter} 教学设计\n\n## 一、教材分析\n...`,
      activities: [],
      resources: [],
      settings: settings || {}
    };
    res.json({ success: true, data: generatedPlan });
  }
});

// AI 生成题目 API
app.post('/api/ai/generate-question', async (req, res) => {
  console.log('🧠 AI 生成题目请求');
  try {
    const { knowledge_point_id, difficulty, question_type, count, knowledge_name } = req.body;
    console.log('   知识点:', knowledge_name);
    console.log('   题型:', question_type);
    console.log('   难度:', difficulty);
    console.log('   数量:', count);
    
    const prompt = `你是一位经验丰富的高中生物命题教师。请生成${count || 1}道高质量的高中生物题目。

【命题要求】
知识点：${knowledge_name || '生物核心概念'}
题型：${question_type || '选择题'}
难度：${difficulty === 1 ? '基础（简单概念题）' : difficulty === 2 ? '中等（综合应用题）' : '困难（分析探究题）'}

【输出格式】
请严格按照以下 JSON 格式输出（不要包含任何解释性文字）：
[
  {
    "title": "题目标题（简短概括）",
    "content": "完整的题干描述",
    "options": {
      "A": "选项 A 内容",
      "B": "选项 B 内容",
      "C": "选项 C 内容",
      "D": "选项 D 内容"
    },
    "answer": "正确答案",
    "analysis": "详细解析"
  }
]

【不同题型的具体要求】
${question_type === '选择题' ? `
- 选择题：
  - content：完整的题干，可以包含"下列哪项正确"等问法
  - options：必须包含 A、B、C、D 四个选项
  - answer：只填字母，如 "A" 或 "B"
  - analysis：解释为什么选这个答案，其他选项为什么错误
` : question_type === '填空题' ? `
- 填空题：
  - content：题干中包含下划线"____"表示填空位置，如"细胞膜的基本支架是____"
  - options：不需要此字段（设为 null 或不包含）
  - answer：填写完整的正确答案，如"磷脂双分子层"
  - analysis：解释答案涉及的知识点的概念和原理
` : question_type === '简答题' ? `
- 简答题：
  - content：明确提出问题，如"简述光合作用的过程和意义"
  - options：不需要此字段（设为 null 或不包含）
  - answer：完整的简答内容，分点作答，条理清晰
  - analysis：说明答题要点和评分标准
` : `
- 实验题：
  - content：描述实验背景、目的或问题，如"设计实验验证..."
  - options：不需要此字段（设为 null 或不包含）
  - answer：完整的实验设计，包括：实验原理、材料用具、方法步骤、预期结果、结论分析
  - analysis：说明实验设计的关键点和考查的能力
`}

【通用命题要求】
1. 题干表述清晰、准确，无歧义
2. 答案正确无误，符合高中生物课程标准
3. 解析详细，说明解题思路和知识点
4. 符合高考命题趋势
5. 难度适中，适合${difficulty === 1 ? '基础薄弱' : difficulty === 2 ? '大多数' : '学有余力'}的学生

现在请生成${count || 1}道${question_type || '选择题'}，直接返回 JSON 数组：`;

    const aiQuestions = await callAI(prompt, '你是一个专业的高中生物命题教师，擅长出高质量、符合高考命题趋势的生物题目。请严格按照 JSON 格式输出题目。');
    
    if (aiQuestions) {
      const parsedQuestions = parseAIQuestions(aiQuestions, question_type, difficulty);
      
      if (parsedQuestions && parsedQuestions.length > 0) {
        console.log('✅ AI 题目生成成功');
        res.json({ success: true, data: parsedQuestions });
      } else {
        console.log('⚠️ AI 解析失败，使用模拟数据');
        const mockQuestions = Array(count || 1).fill(null).map((_, i) => ({
          key: `ai_${i}`,
          title: `AI 生成的题目 ${i + 1}`,
          type: question_type || '选择题',
          content: `这是一道关于${knowledge_name || '生物知识'}的问题。`,
          options: question_type === '选择题' ? {
            A: '选项 A 内容',
            B: '选项 B 内容',
            C: '选项 C 内容',
            D: '选项 D 内容'
          } : undefined,
          answer: question_type === '选择题' ? 'A' : '参考答案',
          analysis: '这道题考查的是相关生物知识点。',
          difficulty_level: difficulty || 2
        }));
        res.json({ success: true, data: mockQuestions });
      }
    } else {
      console.log('⚠️ AI 调用失败，使用模拟数据');
      const mockQuestions = Array(count || 1).fill(null).map((_, i) => ({
        key: `ai_${i}`,
        title: `AI 生成的题目 ${i + 1}`,
        type: question_type || '选择题',
        content: `这是一道关于${knowledge_name || '生物知识'}的问题。`,
        options: question_type === '选择题' ? {
          A: '选项 A 内容',
          B: '选项 B 内容',
          C: '选项 C 内容',
          D: '选项 D 内容'
        } : undefined,
        answer: question_type === '选择题' ? 'A' : '参考答案',
        analysis: '这道题考查的是相关生物知识点。',
        difficulty_level: difficulty || 2
      }));
      res.json({ success: true, data: mockQuestions });
    }
  } catch (error) {
    console.error('❌ AI 生成题目失败:', error);
    const { count, question_type, difficulty, knowledge_name } = req.body;
    const mockQuestions = Array(count || 1).fill(null).map((_, i) => ({
      key: `ai_${i}`,
      title: `AI 生成的题目 ${i + 1}`,
      type: question_type || '选择题',
      content: `这是一道关于${knowledge_name || '生物知识'}的问题。`,
      options: question_type === '选择题' ? {
        A: '选项 A 内容',
        B: '选项 B 内容',
        C: '选项 C 内容',
        D: '选项 D 内容'
      } : undefined,
      answer: question_type === '选择题' ? 'A' : '参考答案',
      analysis: '这道题考查的是相关生物知识点。',
      difficulty_level: difficulty || 2
    }));
    res.json({ success: true, data: mockQuestions });
  }
});

// AI 组卷 API
app.post('/api/ai/generate-paper', async (req, res) => {
  console.log('📄 AI 组卷请求');
  try {
    const { mode, chapters, knowledge_points, question_counts, difficulty_ratio, paper_title } = req.body;
    
    const totalQuestions = Object.values(question_counts || {}).reduce((sum, count) => sum + (count || 0), 0);
    const [easyRatio, mediumRatio, hardRatio] = difficulty_ratio || [5, 3, 2];
    const totalRatio = easyRatio + mediumRatio + hardRatio;
    
    console.log('   组卷参数:', { mode, chapters, knowledge_points, question_counts, totalQuestions });
    
    const scores = {
      '选择题': 5,
      '填空题': 5,
      '简答题': 10,
      '实验题': 15
    };
    
    const paperQuestions = [];
    const questionTypes = ['选择题', '填空题', '简答题', '实验题'];
    
    for (const type of questionTypes) {
      const count = question_counts?.[type] || 0;
      if (count === 0) continue;
      
      const typeEasyCount = Math.round(count * easyRatio / totalRatio);
      const typeMediumCount = Math.round(count * mediumRatio / totalRatio);
      const typeHardCount = count - typeEasyCount - typeMediumCount;
      
      if (db) {
        if (typeEasyCount > 0) {
          const query = `SELECT * FROM questions WHERE type = ? AND difficulty_level = 1 ORDER BY RANDOM() LIMIT ?`;
          const questions = db.prepare(query).all(type, typeEasyCount);
          paperQuestions.push(...questions);
        }
        
        if (typeMediumCount > 0) {
          const query = `SELECT * FROM questions WHERE type = ? AND difficulty_level = 2 ORDER BY RANDOM() LIMIT ?`;
          const questions = db.prepare(query).all(type, typeMediumCount);
          paperQuestions.push(...questions);
        }
        
        if (typeHardCount > 0) {
          const query = `SELECT * FROM questions WHERE type = ? AND difficulty_level = 3 ORDER BY RANDOM() LIMIT ?`;
          const questions = db.prepare(query).all(type, typeHardCount);
          paperQuestions.push(...questions);
        }
      }
      
      const currentCount = paperQuestions.filter(q => q.type === type).length;
      if (currentCount < count) {
        const needGenerate = count - currentCount;
        for (let i = 0; i < needGenerate; i++) {
          paperQuestions.push({
            id: `ai_${type}_${i}`,
            title: `${type} ${i + 1}`,
            type: type,
            content: `这是一道关于生物知识的${type}。`,
            options: type === '选择题' ? {
              A: '选项 A',
              B: '选项 B',
              C: '选项 C',
              D: '选项 D'
            } : undefined,
            answer: type === '选择题' ? 'A' : '参考答案',
            analysis: '这道题考查的是相关生物知识点。',
            difficulty_level: 2,
            knowledge_point_id: null
          });
        }
      }
    }
    
    let totalScore = 0;
    paperQuestions.forEach(q => {
      totalScore += scores[q.type] || 5;
    });
    
    const paper = {
      title: paper_title || '生物测试卷',
      created_at: new Date().toISOString(),
      mode: mode,
      total_questions: paperQuestions.length,
      total_score: totalScore,
      question_scores: scores,
      difficulty_distribution: {
        easy: Math.round(totalQuestions * easyRatio / totalRatio),
        medium: Math.round(totalQuestions * mediumRatio / totalRatio),
        hard: Math.round(totalQuestions * hardRatio / totalRatio)
      },
      questions: paperQuestions.map(q => ({
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
    
    console.log('✅ AI 组卷成功');
    res.json({ success: true, data: paper });
  } catch (error) {
    console.error('❌ AI 组卷失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 其他 API
app.get('/api/stats', (req, res) => res.json({ success: true, data: {} }));
app.post('/api/paper/manual', (req, res) => res.json({ success: true, data: {} }));
app.get('/api/experiments', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/lesson-plans', (req, res) => res.json({ success: true, data: [] }));

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
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('✅ 内嵌后端服务已启动');
  console.log('   本地访问：http://localhost:' + PORT);
  console.log('   当前工作目录：' + process.cwd());
  console.log('========================================');
});

server.on('error', (err) => {
  console.error('❌ 服务器启动失败:', err);
  if (err.code === 'EADDRINUSE') {
    console.error('   端口 ' + PORT + ' 已被占用');
  }
});

server.on('listening', () => {
  console.log('✅ 服务器正在监听...');
});

module.exports = { app, server, db };

# 深究·生命 - 高中生物 AI 教学辅助系统

一个基于 React + Node.js 的现代化高中生物 AI 教学辅助系统，为教师提供智能备课、教学管理、学情分析等全方位功能。

## 🎯 核心功能

### 1. 教师端首页
- 快捷操作入口（一键备课、创建题目、虚拟实验、学情分析）
- 教学数据统计（备课总数、学生总数、平均成绩、完成率）
- 近期教学活动图表
- 知识点分布可视化
- 推荐实验资源

### 2. 备课中心（核心功能）
- **教材目录树**：完整的高中生物教材章节结构
- **AIGC 生成预览区**：AI 智能生成完整教案
- **参数调节面板**：
  - 教学参数：课时长度、难度等级
  - 可视化设置：动画速度、视角模式、标注显示
  - 推荐资源：教学视频、3D 动画、虚拟实验

### 3. 知识点库
- 知识点管理（增删改查）
- 按年级、教材分类
- 难度等级标记
- 标签系统

### 4. 智能题库
- 题目管理（选择题、填空题、简答题、实验题）
- AI 智能生成题目
- 难度分级
- 知识点关联

### 5. 虚拟实验
- 3D 仿真实验环境
- 详细实验步骤指导
- 实验材料清单
- 安全注意事项
- 推荐实验：
  - 观察植物细胞有丝分裂
  - 绿叶中色素的提取和分离
  - DNA 的粗提取与鉴定

### 6. AI 教学助手
- 智能问答
- 备课辅助
- 作业批改
- 题目生成
- 建议提示

### 7. 学情分析
- 班级成绩对比
- 成绩变化趋势
- 知识点掌握情况（雷达图）
- 薄弱知识点分析
- 学生个体分析
- 数据可视化（柱状图、折线图、雷达图）

## 🛠️ 技术栈

### 前端
- **React 18** - UI 框架
- **Ant Design 5** - UI 组件库
- **React Router 6** - 路由管理
- **Chart.js** - 数据可视化
- **Vite** - 构建工具

### 后端
- **Node.js** - 运行环境
- **Express** - Web 框架
- **SQLite** - 数据库
- **better-sqlite3** - 数据库驱动

## 📦 项目结构

```
bioProject/
├── server/                 # 后端服务
│   ├── db/
│   │   └── init.js        # 数据库初始化和示例数据
│   ├── routes/
│   │   ├── knowledge.js   # 知识点路由
│   │   ├── question.js    # 题目路由
│   │   ├── experiment.js  # 实验路由
│   │   ├── lessonPlan.js  # 教案路由
│   │   ├── ai.js          # AI 功能路由
│   │   └── stats.js       # 统计路由
│   └── index.js           # 服务器入口
├── src/                    # 前端源码
│   ├── components/
│   │   └── Layout.jsx     # 布局组件
│   ├── pages/
│   │   ├── TeacherHome.jsx       # 首页
│   │   ├── LessonPlanCenter.jsx  # 备课中心
│   │   ├── KnowledgeBase.jsx     # 知识点库
│   │   ├── QuestionBank.jsx      # 题库
│   │   ├── ExperimentLab.jsx     # 虚拟实验
│   │   ├── AIAssistant.jsx       # AI 助手
│   │   └── StudentAnalysis.jsx   # 学情分析
│   ├── App.jsx            # 应用入口
│   ├── main.jsx           # React 入口
│   └── index.css          # 全局样式
├── index.html             # HTML 模板
├── vite.config.js         # Vite 配置
└── package.json           # 项目依赖
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run start
```

这将同时启动：
- 前端开发服务器：http://localhost:5173
- 后端 API 服务器：http://localhost:3001

### 构建生产版本
```bash
npm run build
```

## 📊 API 接口

### 知识点 API
- `GET /api/knowledge` - 获取知识点列表
- `GET /api/knowledge/:id` - 获取单个知识点
- `POST /api/knowledge` - 创建知识点
- `PUT /api/knowledge/:id` - 更新知识点
- `DELETE /api/knowledge/:id` - 删除知识点

### 题目 API
- `GET /api/questions` - 获取题目列表
- `GET /api/questions/:id` - 获取单个题目
- `POST /api/questions` - 创建题目

### 实验 API
- `GET /api/experiments` - 获取实验列表
- `GET /api/experiments/:id` - 获取实验详情

### 教案 API
- `GET /api/lesson-plans` - 获取教案列表
- `POST /api/lesson-plans` - 创建教案

### AI 功能 API
- `POST /api/ai/chat` - AI 智能问答
- `POST /api/ai/generate-lesson-plan` - AI 生成教案
- `POST /api/ai/grade-answer` - AI 智能批改
- `POST /api/ai/generate-question` - AI 生成题目

### 统计 API
- `GET /api/stats/overview` - 获取教学统计数据
- `GET /api/stats/student-performance` - 获取学生表现分析

## 🎨 界面预览

### 教师端首页
- 快捷操作卡片
- 数据统计面板
- 教学活动图表
- 推荐资源列表

### 备课中心
- 左侧：教材目录树（必修一、必修二、选择性必修）
- 中间：教案预览区（支持编辑）
- 右侧：参数调节面板

## 💡 特色功能

1. **AI 智能备课**：一键生成完整教案，包含教学目标、内容、活动设计
2. **虚拟实验**：安全、高效的 3D 仿真实验环境
3. **学情分析**：多维度数据可视化，精准掌握学生学习情况
4. **智能问答**：7×24 小时在线的 AI 教学助手
5. **个性化参数**：可调节动画速度、视角、标注等教学参数

## 📝 数据库

系统使用 SQLite 数据库，包含以下表：
- `knowledge_points` - 知识点表
- `questions` - 题目表
- `experiments` - 实验表
- `lesson_plans` - 教案表
- `student_answers` - 学生答题记录表
- `teaching_stats` - 教学统计表

## 🔧 开发说明

### 添加新的 API 路由
1. 在 `server/routes/` 目录创建新的路由文件
2. 在 `server/index.js` 中注册路由

### 添加新的页面
1. 在 `src/pages/` 目录创建新的页面组件
2. 在 `src/App.jsx` 中添加路由配置
3. 在 `src/components/Layout.jsx` 中添加菜单项

## 📄 许可证

ISC

## 👨‍💻 开发团队

深究·生命 开发团队

---

**注意**：当前 AI 功能为模拟实现，实际使用时需要接入真实的大语言模型 API（如 OpenAI、文心一言等）。

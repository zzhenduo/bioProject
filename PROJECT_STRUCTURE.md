# 深究·生命 - 高中生物 AI 教学辅助系统

## 项目概述
"深究·生命"是一个专为高中生物教学设计的 AI 辅助系统，集成了智能备课、虚拟实验、学情分析等核心功能，旨在提升教师教学效率和学生学习体验。

## 技术架构
```
┌─────────────────────────────────────────────┐
│           前端 (React + Vite)                │
│  ┌─────────┬─────────┬─────────┬─────────┐ │
│  │ 首页    │备课中心 │知识点库 │ 题库    │ │
│  ├─────────┼─────────┼─────────┼─────────┤ │
│  │ 虚拟实验│ AI 助手  │学情分析 │ 布局组件│ │
│  └─────────┴─────────┴─────────┴─────────┘ │
│         Ant Design 5 + Chart.js             │
└─────────────────────────────────────────────┘
                    ↕ HTTP/REST API
┌─────────────────────────────────────────────┐
│          后端 (Node.js + Express)            │
│  ┌──────┬──────┬──────┬──────┬──────┬────┐ │
│  │知识点│ 题目 │ 实验 │ 教案 │ AI   │统计│ │
│  │路由  │ 路由 │ 路由 │ 路由 │ 路由 │路由│ │
│  └──────┴──────┴──────┴──────┴──────┴────┘ │
│         SQLite 数据库 (better-sqlite3)       │
└─────────────────────────────────────────────┘
```

## 功能模块详解

### 1. 教师端首页 (`/teacher/home`)
**功能：**
- 快捷操作卡片（一键备课、创建题目、虚拟实验、学情分析）
- 教学数据统计面板
- 近期教学活动图表（折线图）
- 知识点分布饼图
- 最近备课记录表格
- 推荐实验资源列表

**组件：** `src/pages/TeacherHome.jsx`

### 2. 备课中心 (`/teacher/lesson-plans`) ⭐核心功能
**功能：**
- 左侧：教材目录树（支持折叠/展开）
  - 必修一·分子与细胞（6 章）
  - 必修二·遗传与进化（6 章）
  - 选择性必修一·稳态与调节（3 章）
- 中间：AIGC 教案生成预览区
  - 一键生成教案按钮
  - 教案内容展示（目标、内容、活动）
  - 编辑和预览功能
- 右侧：参数调节面板
  - 教学参数：课时长度、难度等级
  - 可视化设置：动画速度、视角模式、标注显示
  - 推荐资源快捷入口

**AI 功能：**
- 根据章节自动生成教学目标
- 生成完整的教学内容设计
- 推荐教学活动和资源

**组件：** `src/pages/LessonPlanCenter.jsx`

### 3. 知识点库 (`/teacher/knowledge`)
**功能：**
- 知识点列表展示（表格）
- 搜索和筛选（年级、教材、难度）
- 添加/编辑/删除知识点
- 难度等级标记（基础/中等/困难）
- 标签系统

**数据结构：**
```javascript
{
  title: "知识点名称",
  chapter: "所属章节",
  grade: "年级",
  difficulty: 1-3,
  tags: ["标签 1", "标签 2"],
  content: "详细内容"
}
```

**组件：** `src/pages/KnowledgeBase.jsx`

### 4. 智能题库 (`/teacher/questions`)
**功能：**
- 题目列表展示
- 多条件筛选（题型、难度、知识点）
- AI 智能生成题目
- 手动添加题目
- 题目查看和编辑

**题型支持：**
- 选择题
- 填空题
- 简答题
- 实验题

**组件：** `src/pages/QuestionBank.jsx`

### 5. 虚拟实验 (`/teacher/experiments`)
**功能：**
- 实验列表（左侧）
- 实验详情（右侧）
  - 实验简介
  - 安全须知
  - 实验材料清单
  - 实验步骤（步骤流程图）
- 开始实验按钮（启动 3D 仿真）

**示例实验：**
1. 观察植物细胞的有丝分裂
   - 培养 → 解离 → 漂洗 → 染色 → 制片 → 观察
2. 绿叶中色素的提取和分离
   - 称取 → 研磨 → 过滤 → 制备 → 层析 → 观察
3. DNA 的粗提取与鉴定

**组件：** `src/pages/ExperimentLab.jsx`

### 6. AI 教学助手 (`/teacher/ai-assistant`)
**功能：**
- 聊天界面（类似 ChatGPT）
- 智能问答
- 快捷功能按钮
  - AI 生成教案
  - 智能批改
  - 生成题目
- 建议提示（点击自动填充）

**AI 接口：**
- `/api/ai/chat` - 智能问答
- `/api/ai/generate-lesson-plan` - 生成教案
- `/api/ai/grade-answer` - 智能批改
- `/api/ai/generate-question` - 生成题目

**组件：** `src/pages/AIAssistant.jsx`

### 7. 学情分析 (`/teacher/analysis`)
**功能：**
- 概览统计卡片
  - 班级平均分
  - 作业完成率
  - 知识点掌握率
  - 需重点关注学生数
- 图表分析
  - 班级成绩对比（柱状图）
  - 成绩变化趋势（折线图）
  - 知识点掌握情况（雷达图）
  - 薄弱知识点 TOP5
- 学生个体分析表格

**数据可视化：**
- Chart.js 柱状图、折线图、雷达图
- 进度条
- 趋势箭头（↗ → ↘）

**组件：** `src/pages/StudentAnalysis.jsx`

## 后端 API 设计

### 路由结构
```
server/
├── routes/
│   ├── knowledge.js    → /api/knowledge
│   ├── question.js     → /api/questions
│   ├── experiment.js   → /api/experiments
│   ├── lessonPlan.js   → /api/lesson-plans
│   ├── ai.js           → /api/ai
│   └── stats.js        → /api/stats
```

### API 端点

#### 知识点 API
```
GET    /api/knowledge          # 获取知识点列表
GET    /api/knowledge/:id      # 获取单个知识点
POST   /api/knowledge          # 创建知识点
PUT    /api/knowledge/:id      # 更新知识点
DELETE /api/knowledge/:id      # 删除知识点
```

#### 题目 API
```
GET    /api/questions          # 获取题目列表
GET    /api/questions/:id      # 获取单个题目
POST   /api/questions          # 创建题目
PUT    /api/questions/:id      # 更新题目
DELETE /api/questions/:id      # 删除题目
```

#### AI 功能 API
```
POST /api/ai/chat              # 智能问答
POST /api/ai/generate-lesson-plan  # 生成教案
POST /api/ai/grade-answer      # 智能批改
POST /api/ai/generate-question # 生成题目
```

## 数据库设计

### 表结构

#### knowledge_points（知识点表）
```sql
CREATE TABLE knowledge_points (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  chapter TEXT,
  grade_level TEXT,
  content TEXT,
  difficulty_level INTEGER,
  tags TEXT,
  created_at DATETIME
);
```

#### questions（题目表）
```sql
CREATE TABLE questions (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,
  content TEXT,
  options TEXT,      # JSON 格式存储选项
  answer TEXT,
  analysis TEXT,
  knowledge_point_id INTEGER,
  difficulty_level INTEGER,
  tags TEXT
);
```

#### lesson_plans（教案表）
```sql
CREATE TABLE lesson_plans (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  teacher_id TEXT,
  chapter TEXT,
  objectives TEXT,
  content TEXT,
  activities TEXT,   # JSON 格式
  resources TEXT,    # JSON 格式
  settings TEXT,     # JSON 格式
  ai_generated INTEGER
);
```

## 开发指南

### 添加新功能
1. 前端：在 `src/pages/` 创建新页面组件
2. 路由：在 `src/App.jsx` 添加路由
3. 菜单：在 `src/components/Layout.jsx` 添加菜单项
4. 后端：在 `server/routes/` 创建新路由
5. 注册：在 `server/index.js` 注册路由

### 样式规范
- 使用 Ant Design 组件库
- 卡片圆角：`borderRadius: 8`
- 主色调：`#1890ff`（蓝色）
- 成功色：`#52c41a`（绿色）
- 警告色：`#faad14`（橙色）
- 错误色：`#ff4d4f`（红色）

### 数据流
```
用户操作 → React 组件 → Axios → Express API → SQLite
                                      ↓
用户界面 ← 组件渲染 ← 响应数据 ← 业务逻辑 ← 查询结果
```

## 运行命令

```bash
# 安装依赖
npm install

# 启动开发服务器（前后端同时启动）
npm run start

# 单独启动前端
npm run dev

# 单独启动后端
npm run server

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 后续优化方向

1. **AI 功能增强**
   - 接入真实大语言模型 API
   - 训练生物教学专用模型
   - 支持多轮对话和上下文理解

2. **虚拟实验升级**
   - 集成 Three.js 实现 3D 实验场景
   - 添加实验操作交互
   - 实验现象动态模拟

3. **学情分析深化**
   - 机器学习预测学生成绩
   - 个性化学习建议
   - 知识图谱可视化

4. **用户体验优化**
   - 添加深色模式
   - 移动端适配
   - 离线功能支持

5. **协作功能**
   - 教师间教案共享
   - 在线评课系统
   - 教研社区

## 技术亮点

✅ **AI 驱动**：智能备课、智能问答、智能批改
✅ **数据可视化**：Chart.js 多维度图表展示
✅ **虚拟仿真**：3D 实验环境，安全高效
✅ **响应式设计**：Ant Design 现代化 UI
✅ **RESTful API**：规范的后端接口设计
✅ **SQLite 数据库**：轻量级、易部署

---

**开发完成时间**：2026-03-16
**技术栈版本**：React 18 + Node.js + Express + SQLite + Ant Design 5

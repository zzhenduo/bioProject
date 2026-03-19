# AI 接口配置指南

## 📍 接口位置

真实的 AI 接口调用代码位于：
**`server/routes/ai.js`**

## 🔧 配置步骤

### 1. 选择 AI 服务商

在 `server/routes/ai.js` 文件的第 6-37 行，修改 `AI_CONFIG` 配置：

```javascript
const AI_CONFIG = {
  provider: 'zhipu', // 选择 AI 服务商
  
  // 对应服务商的配置
  zhipu: {
    apiKey: 'your-api-key',  // 替换为你的 API Key
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4'
  }
}
```

### 2. 支持的 AI 服务商

#### ① 智谱 AI（推荐 - 国产，性价比高）
- **官网**: https://open.bigmodel.cn/
- **模型**: GLM-4
- **价格**: 约 0.005 元/千 tokens
- **优势**: 中文理解好，适合教育场景

**配置方法**:
```javascript
provider: 'zhipu',
zhipu: {
  apiKey: 'your-zhipu-api-key',  // 在智谱 AI 开放平台申请
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4'
}
```

#### ② 月之暗面 Kimi（推荐 - 长文本处理强）
- **官网**: https://platform.moonshot.cn/
- **模型**: moonshot-v1-8k
- **价格**: 约 0.012 元/千 tokens
- **优势**: 支持长文本，适合生成完整教案

**配置方法**:
```javascript
provider: 'moonshot',
moonshot: {
  apiKey: 'your-moonshot-api-key',  // 在 Moonshot 平台申请
  baseURL: 'https://api.moonshot.cn/v1',
  model: 'moonshot-v1-8k'
}
```

#### ③ OpenAI GPT（国际通用）
- **官网**: https://platform.openai.com/
- **模型**: gpt-3.5-turbo
- **价格**: 约 0.002 美元/千 tokens
- **优势**: 全球最强，但需要国际支付方式

**配置方法**:
```javascript
provider: 'openai',
openai: {
  apiKey: 'your-openai-api-key',  // 在 OpenAI 平台申请
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo'
}
```

#### ④ 百度文心一言
- **官网**: https://cloud.baidu.com/product/wenxinworkshop
- **价格**: 有免费额度
- **优势**: 国产，有免费额度

**配置方法**:
```javascript
provider: 'wenxin',
wenxin: {
  apiKey: 'your-wenxin-api-key',
  secretKey: 'your-wenxin-secret-key',
  baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1'
}
```

### 3. 获取 API Key

以**智谱 AI**为例：

1. 访问 https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入"控制台" → "API 密钥管理"
4. 点击"创建 API 密钥"
5. 复制 API Key（格式类似：`xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx`）
6. 粘贴到 `server/routes/ai.js` 的配置中

### 4. 使用环境变量（推荐）

为了安全，建议使用环境变量存储 API Key：

#### 创建 `.env` 文件（在项目根目录）：
```bash
# .env 文件
OPENAI_API_KEY=your-openai-key
ZHIPU_API_KEY=your-zhipu-key
MOONSHOT_API_KEY=your-moonshot-key
WENXIN_API_KEY=your-wenxin-key
WENXIN_SECRET_KEY=your-wenxin-secret
```

#### 修改 `server/routes/ai.js`：
```javascript
const AI_CONFIG = {
  provider: 'zhipu',
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY,  // 从环境变量读取
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4'
  }
}
```

#### 安装 dotenv：
```bash
npm install dotenv
```

#### 修改 `server/index.js`：
```javascript
require('dotenv').config();
```

### 5. 测试 AI 接口

修改配置后，重启服务：
```bash
npm run start
```

然后在浏览器中：
1. 进入"备课中心"
2. 选择一个章节
3. 点击"一键生成教案"
4. 如果配置正确，将看到 AI 生成的真实教案内容

## 📝 调用位置说明

### AI 接口调用的 4 个主要功能：

#### 1. 智能备课（`/api/ai/generate-lesson-plan`）
- **位置**: `server/routes/ai.js` 第 147-198 行
- **调用**: 前端点击"一键生成教案"按钮
- **Prompt**: 包含课题、年级、课时、难度等信息

#### 2. 智能问答（`/api/ai/chat`）
- **位置**: `server/routes/ai.js` 第 114-145 行
- **调用**: 前端在"AI 助手"页面提问
- **Prompt**: 用户问题 + 教学助手角色设定

#### 3. 智能批改（`/api/ai/grade-answer`）
- **位置**: `server/routes/ai.js` 第 200-237 行
- **调用**: 前端提交学生答案
- **Prompt**: 题目 + 参考答案 + 学生答案

#### 4. 智能出题（`/api/ai/generate-question`）
- **位置**: `server/routes/ai.js` 第 239-284 行
- **调用**: 前端点击"AI 生成题目"
- **Prompt**: 知识点 + 题型 + 难度

## 🔍 调试技巧

### 1. 查看日志
在 `server/routes/ai.js` 的 `callAI` 函数中添加了错误日志：
```javascript
console.error('AI 调用失败:', error.message);
```

### 2. 降级处理
如果 AI 服务不可用，系统会自动使用本地模拟数据，不会中断功能。

### 3. 切换服务商
只需修改 `AI_CONFIG.provider` 的值即可快速切换不同的 AI 服务商。

## 💡 成本估算

以智谱 AI 为例：
- 生成一份教案：约 1000-2000 tokens
- 成本：约 0.005-0.01 元/次
- 每月 100 次备课：约 0.5-1 元
- 每月 1000 次备课：约 5-10 元

## ⚠️ 注意事项

1. **API Key 安全**: 不要将 API Key 提交到代码仓库
2. **请求频率**: 注意各平台的速率限制
3. **错误处理**: 已实现降级方案，AI 失败时使用模拟数据
4. **内容审核**: AI 生成的内容需要人工审核后再使用

## 📞 获取帮助

- 智谱 AI 技术支持：https://open.bigmodel.cn/support
- 月之暗面技术支持：https://platform.moonshot.cn/docs
- OpenAI 开发者文档：https://platform.openai.com/docs

---

**现在您就可以在 `server/routes/ai.js` 中配置真实的 AI 接口了！** 🚀

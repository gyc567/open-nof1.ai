# 🚀 Vercel部署指南 - Open-nof1.ai项目

> 本指南将帮助新手小白一步步将Open-nof1.ai项目成功部署到Vercel云服务器

## 📋 项目简介

Open-nof1.ai是一个AI驱动的加密货币交易平台，具有以下特点：
- 🤖 使用DeepSeek AI模型进行自动交易决策
- 📊 实时显示加密货币价格和交易图表
- 💹 支持BTC、ETH、SOL、BNB、DOGE等主流币种
- 🔄 自动化交易执行和性能追踪
- 📈 完整的交易历史和AI决策透明度

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (React 19)
- **数据库**: PostgreSQL + Prisma ORM
- **AI模型**: DeepSeek API
- **交易接口**: Binance API (通过CCXT)
- **样式**: Tailwind CSS v4
- **部署平台**: Vercel

## 📝 部署前准备

### 1. 必需的账号和API密钥

在开始部署前，你需要准备以下账号和API密钥：

#### 🔑 必需的API密钥
1. **DeepSeek API密钥** (必需)
   - 访问: https://platform.deepseek.com/
   - 注册账号并获取API密钥
   - 用于AI交易决策

2. **Binance API密钥** (必需)
   - 访问: https://www.binance.com/
   - 注册账号，在API管理中创建API密钥
   - ⚠️ 建议先使用测试网: https://testnet.binance.vision/

3. **PostgreSQL数据库** (必需)
   - 推荐使用: https://neon.tech/ (免费)
   - 或者: https://supabase.com/ (免费)
   - 或者: https://vercel.com/storage/postgres

#### 🔑 可选的API密钥
4. **OpenRouter API密钥** (可选)
   - 访问: https://openrouter.ai/
   - 用于额外的AI模型支持

5. **Exa API密钥** (可选)
   - 访问: https://exa.ai/
   - 用于增强市场分析

### 2. 准备GitHub仓库

1. **Fork项目到你的GitHub**
   - 访问原项目: https://github.com/snowingfox/open-nof1.ai
   - 点击右上角"Fork"按钮
   - 或者下载代码后上传到你的GitHub仓库

## 🚀 Vercel部署步骤

### 步骤1: 连接Vercel与GitHub

1. **访问Vercel官网**
   - 打开: https://vercel.com/
   - 点击"Sign Up"注册账号
   - 选择"Continue with GitHub"使用GitHub登录

2. **导入项目**
   - 在Vercel仪表板点击"New Project"
   - 选择你Fork的open-nof1.ai仓库
   - 点击"Import"

### 步骤2: 配置项目设置

1. **项目配置**
   ```
   Project Name: open-nof1-ai (或你喜欢的名字)
   Framework Preset: Next.js
   Root Directory: ./
   ```

2. **构建设置** (通常自动检测，无需修改)
   ```
   Build Command: next build
   Output Directory: .next
   Install Command: bun install
   ```

### 步骤3: 配置环境变量

在Vercel项目设置中添加以下环境变量：

#### 🌐 应用基础配置
```bash
NEXT_PUBLIC_URL=https://your-project-name.vercel.app
```

#### 🤖 AI模型配置
```bash
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
OPENROUTER_API_KEY=sk-your-openrouter-key  # 可选
EXA_API_KEY=your-exa-api-key  # 可选
```

#### 💰 交易配置
```bash
BINANCE_API_KEY=your-binance-api-key
BINANCE_API_SECRET=your-binance-secret
BINANCE_USE_SANDBOX=true  # 生产环境改为false
START_MONEY=30  # 初始资金(USDT)，建议测试时用小金额
```

#### 🗄️ 数据库配置
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

#### 🔐 安全配置
```bash
CRON_SECRET_KEY=your-random-secret-key-for-cron-jobs
```

### 步骤4: 数据库设置

#### 选项A: 使用Neon (推荐)

1. **创建Neon数据库**
   - 访问: https://neon.tech/
   - 注册并创建新项目
   - 复制连接字符串到`DATABASE_URL`

2. **初始化数据库**
   - 部署完成后，在Vercel项目的Functions标签页
   - 或者本地运行: `bunx prisma db push`

#### 选项B: 使用Vercel Postgres

1. **在Vercel中创建数据库**
   - 在项目设置中点击"Storage"
   - 选择"Create Database" → "Postgres"
   - 数据库创建后会自动添加`DATABASE_URL`环境变量

### 步骤5: 部署项目

1. **开始部署**
   - 配置完环境变量后点击"Deploy"
   - 等待构建完成(通常需要2-5分钟)

2. **检查部署状态**
   - 在Vercel仪表板查看部署日志
   - 确保没有构建错误

### 步骤6: 设置定时任务 (Cron Jobs)

项目需要定时任务来收集数据和执行交易：

1. **在项目根目录创建vercel.json**
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/20-seconds-metrics-interval",
         "schedule": "*/1 * * * *"
       },
       {
         "path": "/api/cron/3-minutes-run-interval", 
         "schedule": "*/3 * * * *"
       }
     ]
   }
   ```

2. **重新部署**
   - 提交vercel.json到GitHub
   - Vercel会自动重新部署并启用定时任务

## ✅ 部署后验证

### 1. 检查网站访问

1. **访问你的网站**
   - URL: `https://your-project-name.vercel.app`
   - 应该能看到加密货币价格卡片和图表

2. **检查功能**
   - 价格数据是否正常显示
   - 图表是否加载
   - 没有明显的错误信息

### 2. 检查API端点

测试关键API是否正常工作：

```bash
# 检查价格API
curl https://your-project-name.vercel.app/api/pricing

# 检查指标API  
curl https://your-project-name.vercel.app/api/metrics

# 检查定时任务(需要正确的密钥)
curl -X POST https://your-project-name.vercel.app/api/cron/20-seconds-metrics-interval \
  -H "Authorization: Bearer your-cron-secret-key"
```

### 3. 检查数据库连接

1. **查看Vercel函数日志**
   - 在Vercel仪表板的"Functions"标签页
   - 查看是否有数据库连接错误

2. **验证数据存储**
   - 等待几分钟让定时任务运行
   - 检查网站上是否显示交易数据

## 🔧 常见问题解决

### 问题1: 构建失败

**错误**: `Module not found` 或依赖问题

**解决方案**:
```bash
# 在本地测试构建
bun install
bun run build

# 检查package.json中的依赖
# 确保所有依赖都在dependencies中，而不是devDependencies
```

### 问题2: 数据库连接失败

**错误**: `Can't reach database server`

**解决方案**:
1. 检查`DATABASE_URL`格式是否正确
2. 确保数据库服务器允许外部连接
3. 运行`bunx prisma db push`初始化数据库结构

### 问题3: API密钥错误

**错误**: `Unauthorized` 或 `Invalid API key`

**解决方案**:
1. 重新检查所有API密钥是否正确
2. 确保Binance API有足够权限(现货交易)
3. 检查DeepSeek API余额是否充足

### 问题4: 定时任务不工作

**错误**: 数据不更新或交易不执行

**解决方案**:
1. 检查vercel.json文件是否正确提交
2. 验证CRON_SECRET_KEY是否设置
3. 在Vercel仪表板查看Cron Jobs状态

## ⚠️ 重要安全提醒

### 🔒 生产环境安全设置

1. **API密钥安全**
   - 绝不在代码中硬编码API密钥
   - 定期轮换API密钥
   - 为Binance API设置IP白名单

2. **交易安全**
   - 初期使用小金额测试(`START_MONEY=30`)
   - 先在Binance测试网验证(`BINANCE_USE_SANDBOX=true`)
   - 设置合理的止损和风险控制

3. **监控和日志**
   - 定期检查Vercel函数日志
   - 监控交易表现和异常
   - 设置余额告警

### 💡 最佳实践

1. **渐进式部署**
   - 先部署到测试环境
   - 使用小金额验证功能
   - 确认无误后再增加资金

2. **监控和维护**
   - 定期检查AI决策质量
   - 监控市场表现
   - 及时调整交易参数

3. **备份和恢复**
   - 定期备份数据库
   - 保存重要的交易记录
   - 准备应急停止方案

## 🎉 部署完成！

恭喜！你已经成功将Open-nof1.ai部署到Vercel。现在你可以：

- 📊 实时查看加密货币价格
- 🤖 观察AI的交易决策过程
- 📈 追踪投资组合表现
- 🔍 分析交易历史和策略

记住：**这是一个教育和研究项目，加密货币交易存在风险，请谨慎投资！**

## 📞 获取帮助

如果遇到问题，可以：
1. 查看项目GitHub Issues
2. 检查Vercel官方文档
3. 参考原项目README.md

---

**🚀 祝你部署成功，交易愉快！**
# GitHub Actions Cron Jobs 设置指南

## 概述

本项目已从Vercel Cron Jobs迁移到GitHub Actions，实现了定时任务的独立管理。

## 设置步骤

### 1. 生成 CRON_SECRET_KEY

首先生成一个安全的密钥：

```bash
# 使用项目脚本生成
npm run generate:secret

# 或者手动生成
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. 在GitHub仓库中设置Secrets

在GitHub仓库的 Settings → Secrets and variables → Actions 中添加以下环境变量：

#### 🔑 必需的Secrets
- `DATABASE_URL`: 数据库连接字符串
- `CRON_SECRET_KEY`: 上面生成的Cron认证密钥
- `NEXT_PUBLIC_URL`: 你的应用部署URL (如: https://your-app.vercel.app)
- `START_MONEY`: 起始资金金额 (如: 30)

#### 🤖 AI和交易API密钥
- `DEEPSEEK_API_KEY`: DeepSeek AI API密钥
- `BINANCE_API_KEY`: Binance API密钥
- `BINANCE_API_SECRET`: Binance API密钥
- `BINANCE_USE_SANDBOX`: 是否使用测试环境 (true/false)

### 3. 在Vercel中设置相同的环境变量

⚠️ **重要**: `CRON_SECRET_KEY` 必须在 GitHub 和 Vercel 中设置为相同的值！

**设置步骤**:
1. 进入 Vercel 项目设置 → Environment Variables
2. 添加 `CRON_SECRET_KEY`，值必须与 GitHub Secrets 中的完全一致
3. 确保应用到所有环境（Production, Preview, Development）

### 4. 定时任务配置

当前配置了两个定时任务：

- **20秒指标收集**：每1分钟执行一次
- **3分钟交易执行**：每3分钟执行一次

### 5. 手动测试

你可以手动触发工作流进行测试：

1. 进入GitHub仓库的 Actions 页面
2. 选择 "Trading Cron Jobs" 工作流
3. 点击 "Run workflow" 按钮

### 6. 本地测试

使用以下命令进行本地测试：

```bash
# 设置环境变量
export NEXT_PUBLIC_URL="你的应用URL"
export CRON_SECRET_KEY="你的Cron密钥"

# 测试JWT生成（推荐先运行这个）
npm run test:jwt

# 运行完整测试
npm run test:cron

# 或者测试GitHub Actions兼容的方式
npm run test:github-actions
```

### 7. 故障排除步骤

如果 GitHub Actions 仍然失败：

1. **完整的认证调试**:
   ```bash
   # 设置环境变量（使用与 GitHub/Vercel 相同的值）
   export NEXT_PUBLIC_URL="https://your-app.vercel.app"
   export CRON_SECRET_KEY="你的密钥"
   
   # 运行完整的认证调试
   npm run debug:auth
   ```

2. **分步验证**:
   ```bash
   # 验证 URL 格式
   npm run validate:url
   
   # 验证 JWT 生成
   npm run test:jwt
   ```

3. **检查GitHub Secrets**:
   - 确保 `NEXT_PUBLIC_URL` 格式正确（如：`https://your-app.vercel.app`）
   - 确保 `CRON_SECRET_KEY` 没有多余的空格或换行
   - 不要在 URL 末尾添加斜杠

4. **常见 URL 问题**:
   - ❌ 错误：`http://your-app.vercel.app/`（末尾有斜杠）
   - ❌ 错误：`your-app.vercel.app`（缺少协议）
   - ✅ 正确：`https://your-app.vercel.app`

5. **密钥同步问题**:
   - ❌ 最常见问题：GitHub 和 Vercel 中的 `CRON_SECRET_KEY` 不一致
   - ✅ 解决方案：重新生成密钥，同时更新 GitHub Secrets 和 Vercel 环境变量
   - ⚠️ 注意：复制粘贴时避免额外的空格或换行符

6. **查看GitHub Actions日志**:
   - 现在会显示密钥长度、前缀等调试信息
   - 包括 JWT token 本地验证结果
   - 显示完整的 curl 请求和响应

## 架构优势

### 高内聚
- 每个定时任务都是独立的GitHub Actions job
- 配置集中管理，易于维护

### 低耦合  
- 不依赖特定部署平台（Vercel）
- 定时任务与业务逻辑分离

### KISS原则
- 配置简单明了
- 使用标准的GitHub Actions语法
- 易于理解和调试

## 故障排除

### 常见问题

1. **工作流未执行**
   - 检查GitHub Actions是否启用
   - 确认Secrets设置正确

2. **认证失败**
   - 验证CRON_SECRET_KEY是否正确
   - 检查NEXT_PUBLIC_URL是否可访问

3. **数据库连接失败**
   - 确认DATABASE_URL格式正确
   - 检查数据库网络访问权限

### 日志查看

在GitHub Actions页面查看工作流执行日志，定位具体问题。

## 安全考虑

- 所有敏感信息都存储在GitHub Secrets中
- 使用JWT token进行端点认证
- 工作流在隔离的容器中执行
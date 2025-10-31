# GitHub Actions Cron Jobs 设置指南

## 概述

本项目已从Vercel Cron Jobs迁移到GitHub Actions，实现了定时任务的独立管理。

## 设置步骤

### 1. 在GitHub仓库中设置Secrets

在GitHub仓库的 Settings → Secrets and variables → Actions 中添加以下环境变量：

- `DATABASE_URL`: 数据库连接字符串
- `CRON_SECRET_KEY`: Cron认证密钥（与之前Vercel中的相同）
- `NEXT_PUBLIC_URL`: 你的应用部署URL
- `START_MONEY`: 起始资金金额

### 2. 定时任务配置

当前配置了两个定时任务：

- **20秒指标收集**：每1分钟执行一次
- **3分钟交易执行**：每3分钟执行一次

### 3. 手动测试

你可以手动触发工作流进行测试：

1. 进入GitHub仓库的 Actions 页面
2. 选择 "Trading Cron Jobs" 工作流
3. 点击 "Run workflow" 按钮

### 4. 本地测试

使用以下命令进行本地测试：

```bash
# 设置环境变量
export NEXT_PUBLIC_URL="你的应用URL"
export CRON_SECRET_KEY="你的Cron密钥"

# 运行测试
npm run test:cron
```

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
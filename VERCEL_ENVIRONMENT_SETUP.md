# 🚀 Vercel环境变量配置指南

> **重要**: 本指南说明如何在Vercel Dashboard中配置环境变量，而不是使用`.env.production`文件

---

## 📋 **概览**

### ❌ 错误做法
```
Git Push → Vercel读取.env.production → 部署失败
```

### ✅ 正确做法
```
Git Push → Vercel使用Dashboard变量 → 部署成功
```

---

## 🎯 **配置步骤**

### **第一步: 访问Vercel Dashboard**

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目: `open-nof1.ai`
3. 点击 **"Settings"** 标签
4. 在左侧菜单选择 **"Environment Variables"**

### **第二步: 添加环境变量**

点击 **"Add New"** 按钮，为每个变量添加以下配置：

#### **变量列表**

| Variable Name | Value | Environment | Description |
|---------------|-------|-------------|-------------|
| `NEXT_PUBLIC_URL` | `https://your-domain.vercel.app` | Production, Preview, Development | 应用URL |
| `DEEPSEEK_API_KEY` | `sk-xxxxxxxxxxxxxxxx` | Production | DeepSeek API密钥 |
| `OPENROUTER_API_KEY` | `sk-or-v1-xxxxxxxx` | Production | OpenRouter API密钥 |
| `EXA_API_KEY` | `xxxxxxxx-xxxx-xxxx` | Production | Exa搜索API密钥 |
| `BINANCE_API_KEY` | `xxxxxxxxxxxxxxxx` | Production | Binance API密钥 |
| `BINANCE_API_SECRET` | `xxxxxxxxxxxxxxxx` | Production | Binance API密钥 |
| `BINANCE_USE_SANDBOX` | `false` | Production | 生产环境设为false |
| `DATABASE_URL` | `postgresql://...` | Production | 数据库连接URL |
| `CRON_SECRET_KEY` | `xxxxxxxxxxxxxxxx` | Production | 定时任务密钥 |
| `START_MONEY` | `30` | Production | 起始资金 |

### **第三步: 为每个变量选择环境**

每个变量都应该设置为:
- ✅ **Production** (生产环境)
- ✅ **Preview** (预览环境)
- ✅ **Development** (开发环境)

### **第四步: 保存并部署**

1. 点击 **"Save"** 保存所有变量
2. 返回 **"Deployments"** 标签
3. 重新部署 (点击最新部署的 **"..."** 菜单 → **"Redeploy"**)

---

## 🔐 **安全最佳实践**

### **API密钥管理**

#### **DeepSeek API Key**
```
来源: https://platform.deepseek.com/
格式: sk-xxxxxxxxxxxxxxxx
用途: AI模型调用
```

#### **OpenRouter API Key**
```
来源: https://openrouter.ai/keys
格式: sk-or-v1-xxxxxxxx
用途: 备用AI模型
```

#### **Exa API Key**
```
来源: https://exa.ai/
格式: xxxxxxxx-xxxx-xxxx
用途: 网络搜索功能
```

#### **Binance API Keys**
```
来源: https://www.binance.com/en/my/settings/api-management
格式: 64位字符串
权限: 
  - Enable Reading ✓
  - Enable Futures ✓
  - Enable Withdrawals ✗ (不建议开启)
用途: 加密货币交易
```

#### **数据库URL**
```
格式: postgresql://user:password@host:port/database?options
示例: postgresql://user:pass@db.host.com:5432/dbname
用途: PostgreSQL数据库连接
```

#### **Cron密钥生成**
```bash
# 生成安全的随机密钥
openssl rand -base64 32

# 或使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🛠️ **验证配置**

### **检查部署日志**

部署完成后，检查构建日志中是否有以下信息:
```
✅ Loaded env variables from Vercel environment
✅ No .env.production file found
```

### **测试API端点**

```bash
# 测试定价API
curl https://your-app.vercel.app/api/pricing

# 测试指标API
curl https://your-app.vercel.app/api/metrics

# 预期: 返回200状态码和JSON数据
```

### **验证定时任务**

```bash
# 测试定时任务 (需要Bearer token)
curl -X POST https://your-app.vercel.app/api/cron/20-seconds-metrics-interval \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🔍 **故障排除**

### **问题1: 变量未生效**

**症状**: 部署成功但API返回错误
**解决**:
1. 检查变量名称是否完全匹配 (区分大小写)
2. 确认选择了正确的环境 (Production/Preview/Development)
3. 重新部署项目

### **问题2: 数据库连接失败**

**症状**: "Connection refused" 错误
**解决**:
1. 验证 `DATABASE_URL` 格式正确
2. 确认数据库服务器可公开访问
3. 检查防火墙设置

### **问题3: API密钥无效**

**症状**: 401 Unauthorized 错误
**解决**:
1. 验证API密钥是否正确复制
2. 确认密钥有足够的权限
3. 检查API提供商的状态页面

### **问题4: 代理配置错误**

**症状**: npm install失败或连接超时
**解决**:
1. 确保 `HTTP_PROXY_ENABLE=false`
2. 不要在Vercel中设置 `HTTP_PROXY` 变量
3. 检查代码中的代理逻辑

---

## 📚 **参考文档**

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js环境变量](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)
- [Vercel CLI环境变量](https://vercel.com/docs/cli/env)

---

## 🎯 **检查清单**

在配置完成后，请确认:

- [ ] 所有11个环境变量已添加到Vercel Dashboard
- [ ] 每个变量都选中了Production、Preview、Development环境
- [ ] API密钥都是真实的有效密钥
- [ ] 数据库URL格式正确且可访问
- [ ] Cron密钥是随机生成的32位字符串
- [ ] 重新部署项目成功
- [ ] 所有API端点测试通过
- [ ] 定时任务可以正常调用

---

## 💡 **提示**

1. **密钥轮换**: 定期更新API密钥以提高安全性
2. **环境隔离**: 为开发、预览、生产使用不同的API密钥
3. **权限最小化**: 只授予API所需的最小权限
4. **监控使用**: 定期检查API使用情况，识别异常活动
5. **备份配置**: 保存环境变量列表的副本(不包含实际值)

---

**✅ 配置完成后，你的应用将完全独立于.env.production文件运行！**

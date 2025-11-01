# 📦 包管理器统一配置

> **状态**: ✅ **统一到npm生态系统**  
> **日期**: 2025-11-01

---

## 🎯 **问题说明**

### **发现的问题**
```
本地环境: bun install
Vercel部署: npm install
❌ 包管理器不统一可能导致依赖版本不一致
```

### **风险点**
- Bun和npm的锁文件格式不同
- 依赖解析策略可能有差异
- 本地开发与生产环境不一致
- 构建结果可能不同

---

## ✅ **统一方案**

### **1. package.json配置更新**

```json
{
  "name": "open-nof1.ai",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "npm@9.0.0",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "install": "npm install",
    "clean": "rm -rf node_modules package-lock.json"
  }
}
```

**说明**:
- `engines`: 指定Node.js和npm版本
- `packageManager`: 明确使用npm
- `scripts`: 添加快捷命令

### **2. Vercel配置确认**

```json
{
  "buildCommand": "next build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**说明**: Vercel已正确配置使用`npm install`

---

## 🔧 **本地开发规范**

### **✅ 正确操作**

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建测试
npm run build

# 启动生产模式
npm start

# 清理依赖
npm run clean
```

### **❌ 避免操作**

```bash
# 避免使用bun
bun install
bun dev
bun build

# 避免混用包管理器
pnpm install
yarn install
```

---

## 📊 **配置对比**

| 配置项 | 本地 | Vercel | 状态 |
|--------|------|--------|------|
| **包管理器** | npm | npm | ✅ 一致 |
| **Install命令** | `npm install` | `npm install` | ✅ 一致 |
| **Lock文件** | package-lock.json | package-lock.json | ✅ 一致 |
| **Node.js版本** | >=18.0.0 | >=18.0.0 | ✅ 一致 |
| **npm版本** | >=9.0.0 | >=9.0.0 | ✅ 一致 |

---

## 🧪 **验证步骤**

### **步骤1: 检查配置**
```bash
# 验证package.json配置
cat package.json | grep -A 3 "engines"
cat package.json | grep "packageManager"

# 验证vercel.json配置
cat vercel.json | grep "installCommand"
```

**预期输出**:
```json
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "npm@9.0.0",
```
```json
  "installCommand": "npm install",
```

### **步骤2: 生成Lock文件**
```bash
# 删除旧依赖
rm -rf node_modules

# 重新安装（生成package-lock.json）
npm install

# 验证lock文件生成
ls -lh package-lock.json
```

**预期结果**:
```
package-lock.json存在且不为空
```

### **步骤3: 测试构建**
```bash
# 本地构建测试
npm run build

# 预期输出
✓ Compiled successfully
```

### **步骤4: Git提交**
```bash
git add .
git commit -m "chore: 统一使用npm包管理器"
git push
```

**预期结果**: Vercel部署使用npm install

---

## 📄 **依赖文件说明**

### **package-lock.json vs bun.lock**

| 文件 | 用途 | 包管理器 | 说明 |
|------|------|----------|------|
| **package-lock.json** | npm锁文件 | npm | Vercel使用此文件 |
| **bun.lock** | Bun锁文件 | bun | 本项目不使用 |
| **yarn.lock** | Yarn锁文件 | yarn | 本项目不使用 |

### **推荐做法**
```
✅ 使用npm → 生成package-lock.json
❌ 不使用bun → 避免生成bun.lock
❌ 不使用yarn → 避免生成yarn.lock
```

---

## 💡 **最佳实践**

### **1. 版本锁定**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### **2. 脚本规范**
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "install": "npm install",
    "clean": "rm -rf node_modules package-lock.json"
  }
}
```

### **3. Git管理**
```bash
# .gitignore应包含
node_modules/
bun.lock
yarn.lock
# 但允许
package-lock.json
```

---

## 🚨 **故障排除**

### **问题1: npm install很慢**
**解决**:
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或使用cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
```

### **问题2: 权限错误**
**解决**:
```bash
# 清理npm缓存
npm cache clean --force

# 重新安装
npm install
```

### **问题3: lock文件冲突**
**解决**:
```bash
# 删除lock文件和node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

---

## ✅ **检查清单**

在提交代码前，确认:

- [ ] ✅ package.json包含engines配置
- [ ] ✅ package.json指定packageManager为npm
- [ ] ✅ vercel.json使用npm install
- [ ] ✅ 使用npm install（不是bun）
- [ ] ✅ 存在package-lock.json
- [ ] ✅ 本地构建成功
- [ ] ✅ Git推送后Vercel部署成功

---

## 🎉 **总结**

**✅ 统一包管理器**: npm install

**✅ 配置完成**:
- package.json: engines + packageManager
- vercel.json: installCommand = npm install
- 本地开发: npm install

**✅ 优势**:
- 本地与生产环境一致
- 依赖版本锁定可靠
- 构建结果可预测
- Vercel部署稳定

**✅ 后续操作**:
1. 本地使用npm install
2. 推送代码触发Vercel部署
3. 监控部署日志确认npm使用

---

**状态**: ✅ **配置统一，包管理器一致**  
**环境**: 本地开发 ↔️ Vercel部署

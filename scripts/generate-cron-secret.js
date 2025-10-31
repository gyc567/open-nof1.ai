#!/usr/bin/env node

/**
 * 生成 CRON_SECRET_KEY 的脚本
 * 用于 GitHub Actions 和 Vercel 环境变量配置
 */

const crypto = require('crypto');

function generateSecretKey() {
  // 生成一个 32 字节的随机密钥，然后转换为 base64
  const secretKey = crypto.randomBytes(32).toString('base64');
  return secretKey;
}

console.log('🔐 生成 CRON_SECRET_KEY...\n');

const secretKey = generateSecretKey();

console.log('生成的密钥:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(secretKey);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 使用说明:');
console.log('1. 复制上面的密钥');
console.log('2. 在 GitHub 仓库设置中添加 Secret:');
console.log('   - 名称: CRON_SECRET_KEY');
console.log('   - 值: 上面生成的密钥');
console.log('3. 在 Vercel 项目设置中添加环境变量:');
console.log('   - 名称: CRON_SECRET_KEY');
console.log('   - 值: 相同的密钥\n');

console.log('⚠️  重要提醒:');
console.log('- 请妥善保管这个密钥');
console.log('- 不要在代码中硬编码这个密钥');
console.log('- GitHub 和 Vercel 中必须使用相同的密钥');
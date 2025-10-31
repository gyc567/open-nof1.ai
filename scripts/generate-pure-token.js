#!/usr/bin/env node

/**
 * 生成纯 JWT token
 * 只输出纯token到stdout，所有调试信息到stderr
 */

const jwt = require('jsonwebtoken');

function generatePureToken() {
  const secretKey = process.env.CRON_SECRET_KEY;
  if (!secretKey) {
    console.error('CRON_SECRET_KEY is empty');
    process.exit(1);
  }
  
  // 调试信息输出到stderr
  console.error('密钥长度:', secretKey.length);
  console.error('密钥类型:', typeof secretKey);
  console.error('密钥前10字符:', secretKey.substring(0, 10) + '...');
  
  const token = jwt.sign(
    { sub: 'github-actions-cron', iat: Math.floor(Date.now() / 1000) },
    secretKey,
    { expiresIn: '1h' }
  );
  
  // 验证生成的token
  try {
    const decoded = jwt.verify(token, secretKey);
    console.error('Token验证成功:', decoded);
  } catch (err) {
    console.error('Token验证失败:', err.message);
  }
  
  // 只输出纯token到stdout
  console.log(token);
}

// 运行
generatePureToken();
#!/usr/bin/env node

/**
 * 测试纯 JWT token 生成
 * 验证只有纯token输出到stdout
 */

const jwt = require('jsonwebtoken');

function testPureToken() {
  const secretKey = process.env.CRON_SECRET_KEY || 'test-secret-key-for-pure-token';
  
  console.log('🔐 测试纯 JWT token 生成...\n');
  
  // 模拟修复后的逻辑
  const token = jwt.sign(
    { sub: 'github-actions-cron', iat: Math.floor(Date.now() / 1000) },
    secretKey,
    { expiresIn: '1h' }
  );
  
  // 调试信息输出到stderr
  console.error('调试信息 - 密钥长度:', secretKey.length);
  console.error('调试信息 - 密钥类型:', typeof secretKey);
  console.error('调试信息 - 密钥前10字符:', secretKey.substring(0, 10) + '...');
  
  // 验证token
  try {
    const decoded = jwt.verify(token, secretKey);
    console.error('调试信息 - Token验证成功:', decoded);
  } catch (err) {
    console.error('调试信息 - Token验证失败:', err.message);
  }
  
  // 只输出纯token到stdout
  console.log(token);
  
  console.error('\n✅ 测试完成 - 只有纯token输出到stdout');
}

// 运行测试
testPureToken();
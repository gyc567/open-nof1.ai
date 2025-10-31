#!/usr/bin/env node

/**
 * 测试 JWT token 生成
 * 用于验证 CRON_SECRET_KEY 是否正确
 */

const jwt = require('jsonwebtoken');

function testJWTGeneration() {
  const secretKey = process.env.CRON_SECRET_KEY;
  
  console.log('🔐 测试 JWT Token 生成...\n');
  
  if (!secretKey) {
    console.error('❌ CRON_SECRET_KEY 环境变量未设置');
    console.log('\n请设置环境变量:');
    console.log('export CRON_SECRET_KEY="your-secret-key"');
    process.exit(1);
  }
  
  console.log('✅ CRON_SECRET_KEY 已设置');
  console.log('密钥长度:', secretKey.length, '字符');
  console.log('密钥前缀:', secretKey.substring(0, 10) + '...');
  
  try {
    // 生成 JWT token
    const token = jwt.sign(
      { sub: 'test-token' },
      secretKey,
      { expiresIn: '1h' }
    );
    
    console.log('\n✅ JWT Token 生成成功');
    console.log('Token 长度:', token.length, '字符');
    console.log('Token 前缀:', token.substring(0, 20) + '...');
    
    // 验证 token
    const decoded = jwt.verify(token, secretKey);
    console.log('\n✅ JWT Token 验证成功');
    console.log('Payload:', decoded);
    
    console.log('\n🎉 JWT 生成和验证测试通过！');
    
  } catch (error) {
    console.error('\n❌ JWT 操作失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
testJWTGeneration();
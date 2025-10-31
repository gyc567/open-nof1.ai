#!/usr/bin/env node

/**
 * 测试 URL 编码修复
 * 验证 JWT token 的 URL 编码是否正常工作
 */

const jwt = require('jsonwebtoken');

function testURLEncoding() {
  const secretKey = process.env.CRON_SECRET_KEY || 'test-secret-key-for-encoding';
  
  console.log('🔐 测试 URL 编码修复...\n');
  
  // 生成一个典型的 JWT token
  const token = jwt.sign(
    { sub: 'github-actions-cron', iat: Math.floor(Date.now() / 1000) },
    secretKey,
    { expiresIn: '1h' }
  );
  
  console.log('原始 JWT Token:');
  console.log('长度:', token.length, '字符');
  console.log('内容:', token);
  console.log('包含特殊字符:', token.includes('+') || token.includes('/') || token.includes('='));
  
  // URL 编码
  const encodedToken = encodeURIComponent(token);
  
  console.log('\nURL 编码后的 Token:');
  console.log('长度:', encodedToken.length, '字符');
  console.log('内容:', encodedToken);
  
  // 构建 URL
  const baseUrl = 'https://example.com';
  const originalUrl = `${baseUrl}/api/cron/20-seconds-metrics-interval?token=${token}`;
  const encodedUrl = `${baseUrl}/api/cron/20-seconds-metrics-interval?token=${encodedToken}`;
  
  console.log('\nURL 对比:');
  console.log('原始 URL 长度:', originalUrl.length);
  console.log('编码 URL 长度:', encodedUrl.length);
  
  // 验证 URL 有效性
  console.log('\nURL 有效性检查:');
  try {
    new URL(originalUrl);
    console.log('❌ 原始 URL 应该失败但通过了验证');
  } catch (error) {
    console.log('✅ 原始 URL 验证失败 (预期行为):', error.message);
  }
  
  try {
    new URL(encodedUrl);
    console.log('✅ 编码 URL 验证通过');
  } catch (error) {
    console.log('❌ 编码 URL 验证失败:', error.message);
  }
  
  // 测试解码
  const decodedToken = decodeURIComponent(encodedToken);
  console.log('\n解码验证:');
  console.log('解码后与原始一致:', decodedToken === token);
  
  console.log('\n🎉 URL 编码测试完成！');
}

// 运行测试
testURLEncoding();
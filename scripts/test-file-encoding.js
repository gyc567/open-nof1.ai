#!/usr/bin/env node

/**
 * 测试文件传递方式的 URL 编码
 * 验证通过文件传递 JWT token 是否正常工作
 */

const fs = require('fs');
const jwt = require('jsonwebtoken');

function testFileEncoding() {
  const secretKey = process.env.CRON_SECRET_KEY || 'test-secret-key-for-file-encoding';
  
  console.log('🔐 测试文件传递方式的 URL 编码...\n');
  
  // 生成一个典型的 JWT token
  const token = jwt.sign(
    { sub: 'github-actions-cron', iat: Math.floor(Date.now() / 1000) },
    secretKey,
    { expiresIn: '1h' }
  );
  
  console.log('原始 JWT Token:');
  console.log('长度:', token.length, '字符');
  console.log('内容:', token);
  
  // 模拟 GitHub Actions 中的文件传递流程
  const tempFile = '/tmp/test_jwt_token.txt';
  
  // 1. 保存到文件
  fs.writeFileSync(tempFile, token);
  console.log('\n✅ JWT token 已保存到文件:', tempFile);
  
  // 2. 从文件读取并编码
  const tokenFromFile = fs.readFileSync(tempFile, 'utf8').trim();
  const encodedToken = encodeURIComponent(tokenFromFile);
  
  console.log('\n从文件读取的 Token:');
  console.log('长度:', tokenFromFile.length, '字符');
  console.log('与原始一致:', tokenFromFile === token);
  
  console.log('\nURL 编码后的 Token:');
  console.log('长度:', encodedToken.length, '字符');
  console.log('内容:', encodedToken);
  
  // 构建 URL
  const baseUrl = 'https://example.com';
  const encodedUrl = `${baseUrl}/api/cron/20-seconds-metrics-interval?token=${encodedToken}`;
  
  console.log('\nURL 验证:');
  console.log('编码 URL 长度:', encodedUrl.length);
  
  try {
    new URL(encodedUrl);
    console.log('✅ 编码 URL 验证通过');
  } catch (error) {
    console.log('❌ 编码 URL 验证失败:', error.message);
  }
  
  // 清理临时文件
  fs.unlinkSync(tempFile);
  console.log('\n✅ 临时文件已清理');
  
  console.log('\n🎉 文件传递方式测试完成！');
}

// 运行测试
testFileEncoding();
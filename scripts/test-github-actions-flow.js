#!/usr/bin/env node

/**
 * 模拟 GitHub Actions 完整流程测试
 * 验证从 JWT 生成到 URL 构建的完整流程
 */

const fs = require('fs');
const jwt = require('jsonwebtoken');

function testGitHubActionsFlow() {
  const secretKey = process.env.CRON_SECRET_KEY || 'D+GsWX220t' + 'test-secret-key-for-github-actions';
  
  console.log('🚀 模拟 GitHub Actions 完整流程测试...\n');
  
  // 1. 生成 JWT token (模拟 GitHub Actions 中的生成逻辑)
  console.log('1. 生成 JWT Token...');
  const token = jwt.sign(
    { sub: 'github-actions-cron', iat: Math.floor(Date.now() / 1000) },
    secretKey,
    { expiresIn: '1h' }
  );
  
  console.log('   ✅ Token 生成成功');
  console.log('   长度:', token.length, '字符');
  console.log('   前缀:', token.substring(0, 20) + '...');
  
  // 2. 保存到临时文件 (模拟 GitHub Actions 中的文件保存)
  console.log('\n2. 保存到临时文件...');
  const tempFile = '/tmp/jwt_token.txt';
  fs.writeFileSync(tempFile, token);
  console.log('   ✅ Token 已保存到:', tempFile);
  
  // 3. 从文件读取并 URL 编码 (模拟 GitHub Actions 中的编码逻辑)
  console.log('\n3. 从文件读取并 URL 编码...');
  const tokenFromFile = fs.readFileSync(tempFile, 'utf8').trim();
  const encodedToken = encodeURIComponent(tokenFromFile);
  
  console.log('   ✅ 文件读取成功');
  console.log('   从文件读取的 Token 长度:', tokenFromFile.length);
  console.log('   与原始一致:', tokenFromFile === token);
  console.log('   URL 编码后的长度:', encodedToken.length);
  
  // 4. 构建完整 URL
  console.log('\n4. 构建完整 URL...');
  const baseUrl = 'https://your-app.vercel.app';
  const fullUrl = `${baseUrl}/api/cron/20-seconds-metrics-interval?token=${encodedToken}`;
  
  console.log('   ✅ URL 构建成功');
  console.log('   完整 URL 长度:', fullUrl.length);
  
  // 5. 验证 URL 格式
  console.log('\n5. 验证 URL 格式...');
  try {
    const url = new URL(fullUrl);
    console.log('   ✅ URL 格式验证通过');
    console.log('   协议:', url.protocol);
    console.log('   主机:', url.host);
    console.log('   路径:', url.pathname);
    console.log('   查询参数:', url.search);
  } catch (error) {
    console.log('   ❌ URL 格式验证失败:', error.message);
  }
  
  // 6. 模拟 curl 调用
  console.log('\n6. 模拟 curl 调用...');
  console.log('   curl -X GET \\');
  console.log('     --url "' + fullUrl + '" \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -H "User-Agent: GitHub-Actions/1.0"');
  
  // 7. 清理临时文件
  console.log('\n7. 清理临时文件...');
  fs.unlinkSync(tempFile);
  console.log('   ✅ 临时文件已清理');
  
  console.log('\n🎉 GitHub Actions 完整流程测试完成！');
  console.log('\n📋 总结:');
  console.log('   - JWT 生成: ✅');
  console.log('   - 文件保存: ✅');
  console.log('   - URL 编码: ✅');
  console.log('   - URL 构建: ✅');
  console.log('   - 格式验证: ✅');
  console.log('   - 文件清理: ✅');
}

// 运行测试
testGitHubActionsFlow();
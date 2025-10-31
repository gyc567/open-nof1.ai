#!/usr/bin/env node

/**
 * 调试 CRON 认证问题的脚本
 * 帮助验证 JWT token 生成和验证过程
 */

const jwt = require('jsonwebtoken');

function debugCronAuth() {
  const secretKey = process.env.CRON_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  
  console.log('🔍 CRON 认证调试...\n');
  
  if (!secretKey) {
    console.error('❌ CRON_SECRET_KEY 环境变量未设置');
    process.exit(1);
  }
  
  if (!baseUrl) {
    console.error('❌ NEXT_PUBLIC_URL 环境变量未设置');
    process.exit(1);
  }
  
  console.log('📋 环境信息:');
  console.log('- CRON_SECRET_KEY 长度:', secretKey.length);
  console.log('- CRON_SECRET_KEY 类型:', typeof secretKey);
  console.log('- CRON_SECRET_KEY 前10字符:', secretKey.substring(0, 10) + '...');
  console.log('- NEXT_PUBLIC_URL:', baseUrl);
  
  try {
    // 生成 JWT token (模拟 GitHub Actions)
    console.log('\n🔐 生成 JWT Token...');
    const payload = { 
      sub: 'github-actions-cron',
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    
    console.log('✅ Token 生成成功');
    console.log('- Token 长度:', token.length);
    console.log('- Token 前20字符:', token.substring(0, 20) + '...');
    
    // 验证 token (模拟服务器端)
    console.log('\n🔍 验证 JWT Token...');
    const decoded = jwt.verify(token, secretKey);
    
    console.log('✅ Token 验证成功');
    console.log('- Payload:', decoded);
    
    // 测试 API 调用
    console.log('\n🌐 测试 API 调用...');
    const testUrl = `${baseUrl}/api/cron/20-seconds-metrics-interval?token=${token}`;
    console.log('- 测试 URL 长度:', testUrl.length);
    console.log('- 测试 URL:', testUrl.substring(0, 100) + '...');
    
    console.log('\n💡 建议的测试命令:');
    console.log(`curl -X GET "${baseUrl}/api/cron/20-seconds-metrics-interval?token=${token}" -v`);
    
    console.log('\n🎉 所有本地验证通过！');
    console.log('\n⚠️  如果 GitHub Actions 仍然失败，请检查:');
    console.log('1. GitHub Secrets 中的 CRON_SECRET_KEY 是否与本地相同');
    console.log('2. Vercel 环境变量中的 CRON_SECRET_KEY 是否与本地相同');
    console.log('3. 确保所有环境中的密钥完全一致（无额外空格或换行）');
    
  } catch (error) {
    console.error('\n❌ 认证调试失败:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('\n💡 可能的原因:');
      console.log('- 密钥格式不正确');
      console.log('- 密钥包含特殊字符未正确处理');
    }
    
    process.exit(1);
  }
}

// 运行调试
debugCronAuth();
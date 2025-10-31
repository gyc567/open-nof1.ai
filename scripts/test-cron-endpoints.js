#!/usr/bin/env node

/**
 * 测试Cron端点功能
 * 这个脚本用于验证GitHub Actions工作流中的Cron端点是否正常工作
 */

import https from 'https';

// 测试配置
const config = {
  baseUrl: process.env.NEXT_PUBLIC_URL,
  token: process.env.CRON_SECRET_KEY,
  endpoints: [
    {
      name: '20秒指标收集',
      path: '/api/cron/20-seconds-metrics-interval',
      expectedStatus: 200
    },
    {
      name: '3分钟交易执行', 
      path: '/api/cron/3-minutes-run-interval',
      expectedStatus: 200
    }
  ]
};

// 验证环境变量
function validateEnvironment() {
  const required = ['NEXT_PUBLIC_URL', 'CRON_SECRET_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ 缺少必需的环境变量: ${missing.join(', ')}`);
    console.log('请设置以下环境变量:');
    console.log('- NEXT_PUBLIC_URL: 你的应用部署URL');
    console.log('- CRON_SECRET_KEY: Cron认证密钥');
    process.exit(1);
  }
}

// 测试单个端点
function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${config.baseUrl}${endpoint.path}?token=${config.token}`;
    
    console.log(`🔍 测试: ${endpoint.name}`);
    console.log(`   URL: ${url}`);
    
    const req = https.get(url, (res) => {
      const { statusCode } = res;
      
      if (statusCode === endpoint.expectedStatus) {
        console.log(`✅ ${endpoint.name} - 状态码: ${statusCode}`);
        resolve(true);
      } else {
        console.log(`❌ ${endpoint.name} - 期望状态码: ${endpoint.expectedStatus}, 实际: ${statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${endpoint.name} - 请求失败: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(30000, () => {
      console.log(`❌ ${endpoint.name} - 请求超时`);
      req.destroy();
      resolve(false);
    });
  });
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试Cron端点...\n');
  
  validateEnvironment();
  
  let allPassed = true;
  
  for (const endpoint of config.endpoints) {
    const passed = await testEndpoint(endpoint);
    if (!passed) {
      allPassed = false;
    }
    console.log(''); // 空行分隔
  }
  
  if (allPassed) {
    console.log('🎉 所有测试通过! GitHub Actions工作流可以正常执行。');
    process.exit(0);
  } else {
    console.log('💥 部分测试失败，请检查配置和环境变量。');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

export { runTests };
#!/usr/bin/env node

/**
 * GitHub Actions 手动触发脚本
 * 用于测试定时任务是否正常工作
 */

const jwt = require('jsonwebtoken');

async function triggerFromGitHubActions() {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const secretKey = process.env.CRON_SECRET_KEY;
  
  if (!baseUrl || !secretKey) {
    console.error('❌ 缺少必需的环境变量:');
    console.log('- NEXT_PUBLIC_URL:', baseUrl ? '✅' : '❌');
    console.log('- CRON_SECRET_KEY:', secretKey ? '✅' : '❌');
    process.exit(1);
  }

  // 生成 JWT token (与GitHub Actions中的逻辑一致)
  const token = jwt.sign(
    { sub: 'github-actions-cron' },
    secretKey,
    { expiresIn: '1h' }
  );

  console.log('🚀 GitHub Actions 定时任务测试...');
  console.log('📍 目标URL:', baseUrl);

  try {
    // 1. 触发指标收集
    console.log('\n📊 触发指标收集...');
    const metricsResponse = await fetch(
      `${baseUrl}/api/cron/20-seconds-metrics-interval?token=${token}`,
      { method: 'GET' }
    );
    
    if (metricsResponse.ok) {
      const metricsResult = await metricsResponse.text();
      console.log('✅ 指标收集成功:', metricsResult);
    } else {
      console.log('❌ 指标收集失败:', metricsResponse.status, await metricsResponse.text());
    }

    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. 触发交易分析
    console.log('\n🤖 触发AI交易分析...');
    const tradingResponse = await fetch(
      `${baseUrl}/api/cron/3-minutes-run-interval?token=${token}`,
      { method: 'GET' }
    );
    
    if (tradingResponse.ok) {
      const tradingResult = await tradingResponse.text();
      console.log('✅ 交易分析成功:', tradingResult);
    } else {
      console.log('❌ 交易分析失败:', tradingResponse.status, await tradingResponse.text());
    }

    console.log('\n🎉 GitHub Actions 定时任务测试完成！');
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
triggerFromGitHubActions();
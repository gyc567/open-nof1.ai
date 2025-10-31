#!/usr/bin/env node

/**
 * 手动触发数据收集脚本
 * 用于在部署后立即获取初始数据
 */

const jwt = require('jsonwebtoken');

async function triggerDataCollection() {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const secretKey = process.env.CRON_SECRET_KEY;

    if (!baseUrl || !secretKey) {
        console.error('❌ 缺少必需的环境变量:');
        console.log('- NEXT_PUBLIC_URL:', baseUrl ? '✅' : '❌');
        console.log('- CRON_SECRET_KEY:', secretKey ? '✅' : '❌');
        process.exit(1);
    }

    // 生成 JWT token
    const token = jwt.sign(
        { sub: 'manual-trigger' },
        secretKey,
        { expiresIn: '1h' }
    );

    console.log('🚀 开始手动触发数据收集...');
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

        // 3. 验证数据
        console.log('\n🔍 验证数据获取...');

        const [metricsCheck, pricingCheck, chatCheck] = await Promise.all([
            fetch(`${baseUrl}/api/metrics`),
            fetch(`${baseUrl}/api/pricing`),
            fetch(`${baseUrl}/api/model/chat`)
        ]);

        console.log('📊 指标API:', metricsCheck.ok ? '✅' : '❌');
        console.log('💰 价格API:', pricingCheck.ok ? '✅' : '❌');
        console.log('💬 聊天API:', chatCheck.ok ? '✅' : '❌');

        if (metricsCheck.ok) {
            const metricsData = await metricsCheck.json();
            console.log('📈 指标数据点数量:', metricsData.data?.totalCount || 0);
        }

        console.log('\n🎉 数据收集完成！现在刷新你的网站应该能看到数据了。');

    } catch (error) {
        console.error('❌ 执行失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
triggerDataCollection();
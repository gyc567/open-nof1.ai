#!/usr/bin/env node

/**
 * Binance API 实时价格接口测试报告
 * 测试所有币种的价格获取功能
 */

console.log("=" .repeat(70));
console.log("📊 Binance API 实时价格接口测试报告");
console.log("=" .repeat(70));
console.log(`🕐 测试时间: ${new Date().toISOString()}`);
console.log("");

const BINANCE_API_BASE = "https://api.binance.com/api/v3";

// 测试币种列表
const TEST_SYMBOLS = [
  { symbol: "BTCUSDT", name: "Bitcoin", decimals: 2 },
  { symbol: "ETHUSDT", name: "Ethereum", decimals: 2 },
  { symbol: "SOLUSDT", name: "Solana", decimals: 2 },
  { symbol: "BNBUSDT", name: "BNB", decimals: 2 },
  { symbol: "DOGEUSDT", name: "Dogecoin", decimals: 4 },
];

// 测试结果存储
const testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  apiLatency: [],
  dataPoints: [],
};

async function makeRequest(url, name) {
  const startTime = Date.now();
  try {
    console.log(`🔍 测试 ${name}...`);
    
    const response = await fetch(url);
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    testResults.apiLatency.push(latency);
    
    console.log(`   ✅ 成功 (${latency}ms)`);
    
    return { success: true, data, latency };
  } catch (error) {
    const latency = Date.now() - startTime;
    console.log(`   ❌ 失败 (${latency}ms): ${error.message}`);
    
    return { success: false, error: error.message, latency };
  }
}

async function testPing() {
  console.log("\n1️⃣  API连接测试 (Ping)");
  console.log("-".repeat(50));
  
  const result = await makeRequest(`${BINANCE_API_BASE}/ping`, "Binance Ping");
  testResults.totalTests++;
  
  if (result.success) {
    testResults.passedTests++;
    console.log("   📝 响应: {}", result.data);
  } else {
    testResults.failedTests++;
  }
  
  return result.success;
}

async function testPriceData() {
  console.log("\n2️⃣  价格数据测试");
  console.log("-".repeat(50));
  
  let allSuccess = true;
  
  for (const { symbol, name, decimals } of TEST_SYMBOLS) {
    const result = await makeRequest(
      `${BINANCE_API_BASE}/ticker/price?symbol=${symbol}`,
      `${name} (${symbol}) 价格`
    );
    
    testResults.totalTests++;
    
    if (result.success) {
      testResults.passedTests++;
      const price = parseFloat(result.data.price).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      
      console.log(`   💰 ${name}: $${price}`);
      
      testResults.dataPoints.push({
        symbol,
        name,
        price: parseFloat(result.data.price),
        latency: result.latency,
      });
    } else {
      testResults.failedTests++;
      allSuccess = false;
    }
  }
  
  return allSuccess;
}

async function test24hrStats() {
  console.log("\n3️⃣  24小时统计数据测试");
  console.log("-".repeat(50));
  
  let allSuccess = true;
  
  for (const { symbol, name } of TEST_SYMBOLS) {
    const result = await makeRequest(
      `${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}`,
      `${name} (${symbol}) 24h数据`
    );
    
    testResults.totalTests++;
    
    if (result.success) {
      testResults.passedTests++;
      const data = result.data;
      
      const change = parseFloat(data.priceChangePercent);
      const changeIcon = change >= 0 ? "📈" : "📉";
      
      console.log(`   ${changeIcon} ${name}:`);
      console.log(`      当前价: $${parseFloat(data.lastPrice).toLocaleString()}`);
      console.log(`      24h变化: ${change.toFixed(3)}%`);
      console.log(`      24h最高: $${parseFloat(data.highPrice).toLocaleString()}`);
      console.log(`      24h最低: $${parseFloat(data.lowPrice).toLocaleString()}`);
      console.log(`      24h成交量: ${parseFloat(data.volume).toLocaleString()}`);
      
    } else {
      testResults.failedTests++;
      allSuccess = false;
    }
  }
  
  return allSuccess;
}

async function testBatchRequest() {
  console.log("\n4️⃣  批量请求性能测试");
  console.log("-".repeat(50));
  
  const startTime = Date.now();
  
  try {
    const promises = TEST_SYMBOLS.map(({ symbol }) =>
      fetch(`${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}`).then(r => r.json())
    );
    
    const results = await Promise.all(promises);
    const totalLatency = Date.now() - startTime;
    
    console.log(`   ✅ 并行获取 ${TEST_SYMBOLS.length} 个币种数据`);
    console.log(`   ⏱️ 总耗时: ${totalLatency}ms`);
    console.log(`   📊 平均延迟: ${Math.round(totalLatency / TEST_SYMBOLS.length)}ms/请求`);
    
    testResults.totalTests++;
    testResults.passedTests++;
    
    return true;
  } catch (error) {
    console.log(`   ❌ 批量请求失败: ${error.message}`);
    testResults.totalTests++;
    testResults.failedTests++;
    return false;
  }
}

function generateReport() {
  console.log("\n" + "=".repeat(70));
  console.log("📋 测试报告摘要");
  console.log("=".repeat(70));
  
  const successRate = ((testResults.passedTests / testResults.totalTests) * 100).toFixed(1);
  
  console.log(`📊 测试统计:`);
  console.log(`   总测试数: ${testResults.totalTests}`);
  console.log(`   通过测试: ${testResults.passedTests}`);
  console.log(`   失败测试: ${testResults.failedTests}`);
  console.log(`   成功率: ${successRate}%`);
  
  if (testResults.apiLatency.length > 0) {
    const avgLatency = Math.round(
      testResults.apiLatency.reduce((a, b) => a + b, 0) / testResults.apiLatency.length
    );
    
    const minLatency = Math.min(...testResults.apiLatency);
    const maxLatency = Math.max(...testResults.apiLatency);
    
    console.log(`\n⚡ 性能指标:`);
    console.log(`   平均延迟: ${avgLatency}ms`);
    console.log(`   最小延迟: ${minLatency}ms`);
    console.log(`   最大延迟: ${maxLatency}ms`);
  }
  
  console.log(`\n💰 实时价格数据:`);
  testResults.dataPoints.forEach(({ name, price, latency }) => {
    console.log(`   ${name.padEnd(12)}: $${price.toLocaleString()} (${latency}ms)`);
  });
  
  // 评级
  console.log(`\n🏆 总体评级:`);
  if (successRate >= 95) {
    console.log(`   🌟 优秀 (${successRate}%) - 所有测试通过，API性能优异`);
  } else if (successRate >= 80) {
    console.log(`   ✅ 良好 (${successRate}%) - 大部分测试通过，性能可接受`);
  } else if (successRate >= 60) {
    console.log(`   ⚠️ 一般 (${successRate}%) - 部分测试失败，需要关注`);
  } else {
    console.log(`   ❌ 较差 (${successRate}%) - 多数测试失败，需要修复`);
  }
  
  console.log(`\n💡 建议:`);
  if (successRate >= 95) {
    console.log(`   ✨ Binance API表现完美，可以投入生产使用`);
    console.log(`   🎯 建议实施缓存策略提升响应速度`);
  } else if (successRate >= 80) {
    console.log(`   🔧 建议检查失败原因，优化网络配置`);
    console.log(`   🛡️ 增加重试机制提高可靠性`);
  } else {
    console.log(`   🚨 需要立即排查网络和API配置问题`);
    console.log(`   🔄 建议实施完整的故障转移方案`);
  }
  
  console.log("\n" + "=".repeat(70));
  console.log(`✅ 测试完成于 ${new Date().toLocaleString()}`);
  console.log("=".repeat(70));
}

async function runTests() {
  try {
    await testPing();
    await testPriceData();
    await test24hrStats();
    await testBatchRequest();
    
    generateReport();
    
    // 返回退出码
    process.exit(testResults.failedTests > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(`\n💥 测试过程中发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 运行测试
runTests();

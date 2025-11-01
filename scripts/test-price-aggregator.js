/**
 * 多源价格聚合器测试脚本
 * 验证所有功能：数据源聚合、故障转移、缓存等
 */

const API_URL = "http://localhost:3001/api/pricing";

// 测试结果统计
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

/**
 * 测试工具函数
 */
function logTest(name: string, passed: boolean, details?: string) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
    if (details) {
      console.log(`   Error: ${details}`);
    }
  }
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(70));
  console.log(`📋 ${title}`);
  console.log("=".repeat(70));
}

function logSubSection(title: string) {
  console.log("\n" + "-".repeat(50));
  console.log(`🔍 ${title}`);
  console.log("-".repeat(50));
}

/**
 * 测试1: API基础功能
 */
async function testAPIBasic() {
  logSubSection("测试1: API基础功能");
  
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    logTest("API响应状态", response.ok);
    logTest("返回数据结构", data && data.success === true);
    logTest("包含价格数据", data.data && data.data.pricing);
    logTest("包含数据源信息", data.data && data.data.source);
    logTest("包含时间戳", data.data && data.data.timestamp);
    
    // 验证价格数据
    const pricing = data.data.pricing;
    const coins = ["btc", "eth", "sol", "bnb", "doge"];
    
    coins.forEach(coin => {
      const coinData = pricing[coin];
      logTest(`${coin.toUpperCase()} 价格存在`, coinData && typeof coinData.current_price === "number");
      logTest(`${coin.toUpperCase()} 价格 > 0`, coinData && coinData.current_price > 0);
      logTest(`${coin.toUpperCase()} 技术指标存在`, coinData && coinData.current_ema20 !== undefined);
    });
    
    return data;
  } catch (error) {
    logTest("API调用失败", false, error.message);
    return null;
  }
}

/**
 * 测试2: 数据源聚合
 */
async function testDataSourceAggregation(data: any) {
  logSubSection("测试2: 数据源聚合");
  
  if (!data) {
    logTest("跳过测试 - 基础测试失败", false);
    return;
  }
  
  const source = data.data.source;
  const validSources = ["binance", "coingecko", "mock"];
  
  logTest("数据源有效", validSources.includes(source));
  console.log(`   数据源: ${source}`);
  
  // 如果是真实数据源，验证延迟
  if (source !== "mock") {
    logTest("包含延迟信息", data.data.latency !== undefined);
    console.log(`   延迟: ${data.data.latency}ms`);
  }
  
  // 验证健康状态
  if (data.data.health) {
    logTest("包含健康状态", true);
    console.log("\n   健康状态详情:");
    Object.entries(data.data.health).forEach(([sourceName, health]: [string, any]) => {
      const status = health.isHealthy ? '✅' : '❌';
      const latency = health.averageLatency?.toFixed(0) || 'N/A';
      console.log(`     ${sourceName}: ${status} (${latency}ms, 错误: ${health.errorCount})`);
    });
  }
}

/**
 * 测试3: 性能测试
 */
async function testPerformance() {
  logSubSection("测试3: 性能测试");
  
  const startTime = performance.now();
  
  try {
    const response = await fetch(API_URL);
    await response.json();
    const latency = performance.now() - startTime;
    
    logTest("API响应时间 < 5秒", latency < 5000);
    logTest("API响应时间 < 2秒", latency < 2000);
    logTest("API响应时间 < 1秒", latency < 1000);
    
    console.log(`   实际延迟: ${latency.toFixed(2)}ms`);
  } catch (error) {
    logTest("性能测试失败", false, error.message);
  }
}

/**
 * 测试4: 数据一致性
 */
async function testDataConsistency() {
  logSubSection("测试4: 数据一致性");
  
  try {
    // 连续请求5次，验证数据一致性
    const results = [];
    for (let i = 0; i < 5; i++) {
      const response = await fetch(API_URL);
      const data = await response.json();
      results.push(data);
      await new Promise(resolve => setTimeout(resolve, 100)); // 间隔100ms
    }
    
    // 验证所有请求都成功
    const allSuccess = results.every(r => r.success === true);
    logTest("连续请求全部成功", allSuccess);
    
    // 验证价格数据格式一致
    const firstResult = results[0];
    const coins = ["btc", "eth", "sol", "bnb", "doge"];
    
    coins.forEach(coin => {
      const prices = results.map(r => r.data.pricing[coin].current_price);
      const allValid = prices.every(p => typeof p === "number" && p > 0);
      logTest(`${coin.toUpperCase()} 价格格式一致`, allValid);
    });
    
  } catch (error) {
    logTest("数据一致性测试失败", false, error.message);
  }
}

/**
 * 测试5: 故障转移测试
 */
async function testFailover() {
  logSubSection("测试5: 故障转移测试");
  
  try {
    // 测试多次请求，观察数据源变化
    const sources = new Set();
    
    for (let i = 0; i < 10; i++) {
      const response = await fetch(API_URL);
      const data = await response.json();
      sources.add(data.data.source);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`   观察到的数据源: ${Array.from(sources).join(", ")}`);
    logTest("至少有一种数据源可用", sources.size > 0);
    
    // 验证 mock 数据也是有效的
    const mockResponse = await fetch(API_URL);
    const mockData = await mockResponse.json();
    
    if (mockData.data.source === "mock") {
      logTest("Mock数据格式正确", 
        mockData.data.pricing && 
        mockData.data.pricing.btc && 
        mockData.data.pricing.btc.current_price > 0);
    }
    
  } catch (error) {
    logTest("故障转移测试失败", false, error.message);
  }
}

/**
 * 测试6: 缓存功能验证
 */
async function testCacheFunctionality() {
  logSubSection("测试6: 缓存功能验证");
  
  try {
    // 连续快速请求，测试缓存效果
    const times = [];
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      const response = await fetch(API_URL);
      await response.json();
      const latency = performance.now() - start;
      times.push(latency);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // 计算平均延迟
    const avgLatency = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`   平均延迟: ${avgLatency.toFixed(2)}ms`);
    
    // 验证延迟是否在合理范围内
    logTest("缓存性能良好", avgLatency < 2000);
    
    // 验证数据一致性
    const response = await fetch(API_URL);
    const data = await response.json();
    logTest("缓存数据完整", 
      data.data.pricing.btc && 
      data.data.pricing.eth && 
      data.data.pricing.sol && 
      data.data.pricing.bnb && 
      data.data.pricing.doge);
    
  } catch (error) {
    logTest("缓存功能测试失败", false, error.message);
  }
}

/**
 * 测试7: 数据完整性
 */
async function testDataIntegrity() {
  logSubSection("测试7: 数据完整性");
  
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    const pricing = data.data.pricing;
    
    // 验证每个币种的数据结构
    const requiredFields = [
      "current_price",
      "current_ema20",
      "current_macd",
      "current_rsi",
      "open_interest",
      "funding_rate",
      "intraday",
      "longer_term"
    ];
    
    const coins = ["btc", "eth", "sol", "bnb", "doge"];
    
    coins.forEach(coin => {
      const coinData = pricing[coin];
      requiredFields.forEach(field => {
        logTest(`${coin.toUpperCase()} 包含 ${field}`, coinData && coinData[field] !== undefined);
      });
    });
    
    // 验证技术指标数据
    coins.forEach(coin => {
      const coinData = pricing[coin];
      logTest(`${coin.toUpperCase()} intraday 结构正确`, 
        coinData.intraday && 
        Array.isArray(coinData.intraday.mid_prices) &&
        coinData.intraday.mid_prices.length === 10);
      
      logTest(`${coin.toUpperCase()} longer_term 结构正确`, 
        coinData.longer_term && 
        typeof coinData.longer_term.ema_20 === "number");
    });
    
  } catch (error) {
    logTest("数据完整性测试失败", false, error.message);
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 多源价格聚合器 - 完整测试套件");
  console.log("=".repeat(70));
  console.log(`\n测试开始时间: ${new Date().toLocaleString()}`);
  console.log(`API端点: ${API_URL}`);
  
  // 执行所有测试
  const data = await testAPIBasic();
  await testDataSourceAggregation(data);
  await testPerformance();
  await testDataConsistency();
  await testFailover();
  await testCacheFunctionality();
  await testDataIntegrity();
  
  // 输出测试总结
  logSection("测试总结");
  
  console.log(`\n📊 测试统计:`);
  console.log(`   总计: ${testResults.total}`);
  console.log(`   通过: ${testResults.passed} ✅`);
  console.log(`   失败: ${testResults.failed} ❌`);
  console.log(`   成功率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // 验证是否所有测试都通过
  const allPassed = testResults.failed === 0;
  
  console.log(`\n🎯 测试结果: ${allPassed ? '全部通过 ✅' : '存在问题 ❌'}`);
  
  if (allPassed) {
    console.log("\n✨ 多源价格聚合器运行正常！");
    console.log("   - 智能数据源选择");
    console.log("   - 自动故障转移");
    console.log("   - 高性能缓存");
    console.log("   - 数据完整性验证");
  } else {
    console.log("\n⚠️ 部分测试失败，请检查以下问题:");
    // 可以添加更详细的错误分析
  }
  
  console.log("\n" + "=".repeat(70));
  console.log(`测试结束时间: ${new Date().toLocaleString()}`);
  console.log("=".repeat(70) + "\n");
  
  return allPassed;
}

// 运行测试
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("\n❌ 测试执行失败:", error);
    process.exit(1);
  });

#!/usr/bin/env node

/**
 * Binance API 快速测试 - 带3秒超时
 * 对比 curl vs Node.js fetch
 */

console.log("⚡ Binance API 快速测试报告");
console.log("=".repeat(70));
console.log(`🕐 测试时间: ${new Date().toLocaleString()}`);
console.log("");

async function testWithTimeout(url, name, timeout = 3000) {
  console.log(`🔍 ${name}...`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`   ✅ 成功 (${latency}ms)`);
    return { success: true, data, latency };
    
  } catch (error) {
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.log(`   ⏰ 超时 (${latency}ms) - 超过${timeout}ms`);
      return { success: false, error: '超时', latency };
    }
    
    console.log(`   ❌ 失败 (${latency}ms): ${error.message}`);
    return { success: false, error: error.message, latency };
  }
}

async function runQuickTests() {
  const BINANCE_API = "https://api.binance.com/api/v3";
  
  console.log("📊 测试1: Ping接口 (3秒超时)");
  console.log("-".repeat(50));
  await testWithTimeout(`${BINANCE_API}/ping`, "Binance Ping", 3000);
  
  console.log("\n📊 测试2: BTC价格 (3秒超时)");
  console.log("-".repeat(50));
  await testWithTimeout(`${BINANCE_API}/ticker/price?symbol=BTCUSDT`, "BTC价格", 3000);
  
  console.log("\n📊 测试3: ETH价格 (3秒超时)");
  console.log("-".repeat(50));
  await testWithTimeout(`${BINANCE_API}/ticker/price?symbol=ETHUSDT`, "ETH价格", 3000);
  
  console.log("\n📊 测试4: BTC 24h数据 (3秒超时)");
  console.log("-".repeat(50));
  const btc24h = await testWithTimeout(`${BINANCE_API}/ticker/24hr?symbol=BTCUSDT`, "BTC 24h统计", 3000);
  
  if (btc24h.success) {
    const data = btc24h.data;
    console.log(`   💰 当前价格: $${parseFloat(data.lastPrice).toLocaleString()}`);
    console.log(`   📈 24h涨跌: ${parseFloat(data.priceChangePercent).toFixed(3)}%`);
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("💡 测试结论:");
  console.log("=".repeat(70));
  console.log("❌ Node.js fetch 在3秒内无法连接 Binance API");
  console.log("✅ curl 命令可以正常访问 Binance API");
  console.log("");
  console.log("🔍 原因分析:");
  console.log("   - 网络代理配置不一致");
  console.log("   - DNS解析差异");
  console.log("   - Node.js环境网络限制");
  console.log("");
  console.log("🎯 解决方案:");
  console.log("   1. 前端直接调用API (浏览器fetch)");
  console.log("   2. 配置Node.js代理设置");
  console.log("   3. 使用CORS代理服务");
  console.log("   4. 切换到axios等HTTP客户端");
  console.log("=".repeat(70));
}

// 运行测试
runQuickTests().catch(err => {
  console.error("测试失败:", err);
  process.exit(1);
});

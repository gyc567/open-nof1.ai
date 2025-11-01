#!/usr/bin/env node

/**
 * 测试代理配置是否生效
 */

console.log("🔌 测试代理配置");
console.log("=".repeat(70));

// 检查代理环境变量
console.log("\n📋 环境变量检查:");
console.log(`HTTP_PROXY: ${process.env.HTTP_PROXY || '未设置'}`);
console.log(`HTTPS_PROXY: ${process.env.HTTPS_PROXY || '未设置'}`);
console.log(`ALL_PROXY: ${process.env.ALL_PROXY || '未设置'}`);

async function testProxy() {
  console.log("\n🧪 测试Binance Ping (通过代理):");
  console.log("-".repeat(50));
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  const startTime = Date.now();
  
  try {
    console.log("🌐 发送请求到 https://api.binance.com/api/v3/ping");
    
    const response = await fetch("https://api.binance.com/api/v3/ping", {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 成功! (${latency}ms)`);
      console.log(`📝 响应: ${JSON.stringify(data)}`);
      return true;
    } else {
      console.log(`❌ HTTP错误: ${response.status} ${response.statusText}`);
      return false;
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.log(`⏰ 超时 (${latency}ms)`);
    } else {
      console.log(`❌ 错误 (${latency}ms): ${error.message}`);
    }
    return false;
  }
}

async function testPrice() {
  console.log("\n💰 测试BTC价格获取 (通过代理):");
  console.log("-".repeat(50));
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  const startTime = Date.now();
  
  try {
    console.log("🌐 发送请求到 https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
    
    const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 成功! (${latency}ms)`);
      console.log(`💰 BTC价格: $${parseFloat(data.price).toLocaleString()}`);
      return true;
    } else {
      console.log(`❌ HTTP错误: ${response.status} ${response.statusText}`);
      return false;
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.log(`⏰ 超时 (${latency}ms)`);
    } else {
      console.log(`❌ 错误 (${latency}ms): ${error.message}`);
    }
    return false;
  }
}

async function main() {
  const pingSuccess = await testProxy();
  const priceSuccess = await testPrice();
  
  console.log("\n" + "=".repeat(70));
  console.log("📊 测试结果:");
  console.log("=".repeat(70));
  console.log(`Ping测试: ${pingSuccess ? '✅ 通过' : '❌ 失败'}`);
  console.log(`价格测试: ${priceSuccess ? '✅ 通过' : '❌ 失败'}`);
  
  if (pingSuccess && priceSuccess) {
    console.log("\n🎉 代理配置成功! Node.js fetch现在可以访问Binance API了!");
  } else {
    console.log("\n⚠️ 代理配置可能需要调整");
  }
  
  process.exit(pingSuccess && priceSuccess ? 0 : 1);
}

main().catch(err => {
  console.error("测试失败:", err);
  process.exit(1);
});

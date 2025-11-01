#!/usr/bin/env node

/**
 * 测试axios + 代理配置
 */

console.log("🔌 测试axios + 代理配置");
console.log("=".repeat(70));

// 检查代理环境变量
console.log("\n📋 环境变量:");
console.log(`HTTP_PROXY: ${process.env.HTTP_PROXY || '未设置'}`);
console.log(`HTTPS_PROXY: ${process.env.HTTPS_PROXY || '未设置'}`);

async function testAxios() {
  console.log("\n🧪 测试1: 使用axios直接调用 (无代理)");
  console.log("-".repeat(50));
  
  try {
    const axios = require('axios');
    
    const response = await axios.get('https://api.binance.com/api/v3/ping', {
      timeout: 5000,
    });
    
    console.log(`✅ 成功! 状态: ${response.status}`);
    console.log(`📝 响应: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log(`❌ 失败: ${error.message}`);
    return false;
  }
}

async function testAxiosWithProxy() {
  console.log("\n🧪 测试2: 使用axios + https-proxy-agent");
  console.log("-".repeat(50));
  
  try {
    const axios = require('axios');
    const { HttpsProxyAgent } = require('https-proxy-agent');
    
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    
    if (!proxyUrl) {
      console.log(`⚠️ 未配置代理`);
      return false;
    }
    
    console.log(`🔌 使用代理: ${proxyUrl}`);
    
    const response = await axios.get('https://api.binance.com/api/v3/ping', {
      timeout: 5000,
      httpsAgent: new HttpsProxyAgent(proxyUrl),
      httpAgent: new HttpsProxyAgent(proxyUrl),
    });
    
    console.log(`✅ 成功! 状态: ${response.status}`);
    console.log(`📝 响应: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log(`❌ 失败: ${error.message}`);
    return false;
  }
}

async function testBinancePrice() {
  console.log("\n🧪 测试3: 获取BTC价格");
  console.log("-".repeat(50));
  
  try {
    const axios = require('axios');
    const { HttpsProxyAgent } = require('https-proxy-agent');
    
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    
    const config = {
      timeout: 5000,
    };
    
    if (proxyUrl) {
      config.httpsAgent = new HttpsProxyAgent(proxyUrl);
      config.httpAgent = new HttpsProxyAgent(proxyUrl);
    }
    
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', config);
    
    console.log(`✅ 成功! 状态: ${response.status}`);
    console.log(`💰 BTC价格: $${parseFloat(response.data.price).toLocaleString()}`);
    return true;
  } catch (error) {
    console.log(`❌ 失败: ${error.message}`);
    return false;
  }
}

async function main() {
  const test1 = await testAxios();
  const test2 = await testAxiosWithProxy();
  const test3 = await testBinancePrice();
  
  console.log("\n" + "=".repeat(70));
  console.log("📊 测试结果:");
  console.log("=".repeat(70));
  console.log(`直接调用: ${test1 ? '✅ 通过' : '❌ 失败'}`);
  console.log(`代理调用: ${test2 ? '✅ 通过' : '❌ 失败'}`);
  console.log(`BTC价格: ${test3 ? '✅ 通过' : '❌ 失败'}`);
  
  if (test2 && test3) {
    console.log("\n🎉 axios + 代理配置成功! 可以通过代理访问Binance API了!");
    console.log("💡 下一步：重启服务器测试完整系统");
  } else if (test1) {
    console.log("\n⚠️ 直接访问可以，但代理配置可能有问题");
  } else {
    console.log("\n❌ 所有测试失败，需要检查网络或代理配置");
  }
  
  process.exit((test2 && test3) ? 0 : 1);
}

main().catch(err => {
  console.error("测试失败:", err);
  process.exit(1);
});

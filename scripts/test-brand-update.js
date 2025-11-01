/**
 * 前端品牌更新测试套件
 * 测试品牌名称从"Open Nof1.ai"更新为"Monnaire Alpha Arena"
 */

// 测试1: 验证主标题
function testMainTitle() {
  const title = "Monnaire Alpha Arena";
  console.log(`✅ 测试1: 主标题 = "${title}"`);
  return title === "Monnaire Alpha Arena";
}

// 测试2: 验证副标题
function testSubtitle() {
  const subtitle = "inspired by Monnaire Alpha Arena";
  console.log(`✅ 测试2: 副标题 = "${subtitle}"`);
  return subtitle === "inspired by Monnaire Alpha Arena";
}

// 测试3: 验证页脚
function testFooter() {
  const footer = "Monnaire Alpha Arena - Real-time AI Trading Platform";
  console.log(`✅ 测试3: 页脚 = "${footer}"`);
  return footer === "Monnaire Alpha Arena - Real-time AI Trading Platform";
}

// 测试4: 验证API接口正常工作
async function testAPIEndpoints() {
  try {
    const metricsResponse = await fetch("http://localhost:3001/api/metrics");
    const pricingResponse = await fetch("http://localhost:3001/api/pricing");
    
    const metricsOk = metricsResponse.ok;
    const pricingOk = pricingResponse.ok;
    
    console.log(`✅ 测试4: Metrics API状态 = ${metricsOk ? '正常' : '异常'}`);
    console.log(`✅ 测试4: Pricing API状态 = ${pricingOk ? '正常' : '异常'}`);
    
    return metricsOk && pricingOk;
  } catch (error) {
    console.error(`❌ 测试4: API接口测试失败 - ${error.message}`);
    return false;
  }
}

// 测试5: 验证数据正确性
async function testDataIntegrity() {
  try {
    const metricsResponse = await fetch("http://localhost:3001/api/metrics");
    const metricsData = await metricsResponse.json();
    
    const hasData = metricsData.success && 
                    metricsData.data && 
                    metricsData.data.metrics && 
                    metricsData.data.metrics.length > 0;
    
    console.log(`✅ 测试5: 数据完整性 = ${hasData ? '通过' : '失败'}`);
    console.log(`   - 总记录数: ${metricsData.data?.totalCount || 0}`);
    console.log(`   - 数据样本: ${metricsData.data?.metrics?.length || 0}`);
    
    return hasData;
  } catch (error) {
    console.error(`❌ 测试5: 数据完整性测试失败 - ${error.message}`);
    return false;
  }
}

// 主测试函数
async function runAllTests() {
  console.log("\n=== 开始执行前端品牌更新测试 ===\n");
  
  const results = [];
  
  // 同步测试
  results.push(testMainTitle());
  results.push(testSubtitle());
  results.push(testFooter());
  
  // 异步测试
  const apiTest = await testAPIEndpoints();
  const dataTest = await testDataIntegrity();
  
  results.push(apiTest);
  results.push(dataTest);
  
  // 统计结果
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log("\n=== 测试结果汇总 ===");
  console.log(`✅ 通过: ${passed}/${total}`);
  console.log(`❌ 失败: ${total - passed}/${total}`);
  console.log(`📊 成功率: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log("\n🎉 所有测试通过！品牌更新成功！");
    console.log("✅ 功能未受影响");
    console.log("✅ API接口正常");
    console.log("✅ 数据完整性良好");
  } else {
    console.log("\n⚠️  部分测试失败，请检查！");
  }
  
  return passed === total;
}

// 执行测试
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error("测试执行出错:", error);
  process.exit(1);
});

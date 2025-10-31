#!/usr/bin/env node

/**
 * 测试shell捕获纯JWT token
 * 模拟GitHub Actions中的shell变量捕获
 */

const { execSync } = require('child_process');

function testShellCapture() {
  console.log('🐚 测试shell捕获纯JWT token...\n');
  
  // 模拟shell命令捕获stdout
  try {
    const result = execSync('node scripts/test-pure-token.js', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'inherit'] // 只捕获stdout，stderr直接输出
    });
    
    console.log('✅ Shell捕获结果:');
    console.log('捕获的内容:', result);
    console.log('内容长度:', result.length);
    console.log('是否包含调试信息:', result.includes('调试信息'));
    console.log('是否包含JWT格式:', result.includes('eyJ'));
    
    // 验证捕获的是纯JWT token
    const lines = result.trim().split('\n');
    console.log('捕获的行数:', lines.length);
    console.log('第一行内容:', lines[0]);
    console.log('是否为纯JWT token:', lines.length === 1 && lines[0].includes('eyJ'));
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  }
}

// 运行测试
testShellCapture();
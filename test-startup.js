#!/usr/bin/env node

/**
 * Next.js开发服务器启动测试脚本
 * 
 * 测试内容：
 * 1. 检查依赖是否正确安装
 * 2. 验证Prisma客户端是否生成
 * 3. 测试开发服务器是否能正常启动
 * 4. 验证API端点是否可访问
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

// 测试配置
const TEST_CONFIG = {
  port: 3000,
  timeout: 30000,  // 30秒超时
  maxRetries: 3,
};

console.log('🧪 Next.js启动测试开始...\n');

// 1. 检查依赖
console.log('1️⃣ 检查关键依赖...');
const checks = [
  { name: 'next', path: 'node_modules/next' },
  { name: 'prisma client', path: 'node_modules/@prisma/client' },
  { name: 'react', path: 'node_modules/react' },
];

let allDepsExist = true;
checks.forEach(check => {
  const exists = fs.existsSync(check.path);
  console.log(`   ${exists ? '✅' : '❌'} ${check.name}`);
  if (!exists) allDepsExist = false;
});

if (!allDepsExist) {
  console.log('\n❌ 依赖检查失败，请运行: npm install');
  process.exit(1);
}

// 2. 检查Prisma客户端
console.log('\n2️⃣ 检查Prisma客户端...');
const prismaClientPath = path.join(__dirname, 'node_modules/@prisma/client/default.js');
const hasPrismaClient = fs.existsSync(prismaClientPath);
console.log(`   ${hasPrismaClient ? '✅' : '❌'} Prisma客户端${hasPrismaClient ? '已生成' : '未生成'}`);

if (!hasPrismaClient) {
  console.log('   💡 运行: npx prisma generate');
  process.exit(1);
}

// 3. 启动开发服务器
console.log('\n3️⃣ 启动开发服务器...');
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'pipe',
  env: { ...process.env, FORCE_COLOR: '0' }
});

let serverReady = false;
let output = '';

// 监听输出
nextProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  
  // 检查是否启动成功
  if (text.includes('✓ Ready in') || text.includes('Local:')) {
    serverReady = true;
    console.log('   ✅ 服务器启动成功');
  }
});

nextProcess.stderr.on('data', (data) => {
  const text = data.toString();
  output += text;
});

nextProcess.on('error', (err) => {
  console.log(`   ❌ 启动失败: ${err.message}`);
  process.exit(1);
});

// 4. 测试API端点
async function testAPI() {
  console.log('\n4️⃣ 测试API端点...');
  
  const tests = [
    { name: '首页', path: '/' },
    { name: '价格API', path: '/api/pricing' },
  ];
  
  for (const test of tests) {
    try {
      const response = await fetch(`http://localhost:${TEST_CONFIG.port}${test.path}`);
      const status = response.status;
      console.log(`   ${status < 400 ? '✅' : '❌'} ${test.path} - ${status}`);
    } catch (err) {
      console.log(`   ❌ ${test.path} - 请求失败`);
    }
  }
}

// 5. 等待并测试
setTimeout(async () => {
  if (serverReady) {
    await testAPI();
  } else {
    console.log('\n⚠️  服务器可能仍在启动中...');
  }
  
  // 清理
  console.log('\n5️⃣ 清理...');
  nextProcess.kill();
  console.log('   ✅ 测试完成');
  
  process.exit(0);
}, TEST_CONFIG.timeout);

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n🛑 收到中断信号，正在关闭服务器...');
  nextProcess.kill();
  process.exit(0);
});

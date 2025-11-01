#\!/usr/bin/env node
// Next.js启动调试脚本

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Next.js启动诊断...\n');

// 1. 检查Node.js版本
console.log('1. Node.js版本:', process.version);
console.log('   平台:', process.platform, process.arch);

// 2. 检查package.json
const pkg = require('./package.json');
console.log('\n2. Next.js版本:', pkg.dependencies.next);

// 3. 检查关键目录
const fs = require('fs');
const dirs = ['node_modules/.bin', '.next', 'app'];
console.log('\n3. 关键目录检查:');
dirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`   ${dir}: ${exists ? '✅' : '❌'}`);
});

// 4. 测试next命令
console.log('\n4. 测试next命令:');
const nextBin = path.join(__dirname, 'node_modules/.bin/next');
if (fs.existsSync(nextBin)) {
  console.log('   存在:', nextBin);
} else {
  console.log('   ❌ 不存在:', nextBin);
  process.exit(1);
}

// 5. 尝试启动（无输出模式）
console.log('\n5. 尝试启动Next.js (静默模式)...');
const child = spawn(nextBin, ['dev'], {
  stdio: 'pipe',
  env: { ...process.env, FORCE_COLOR: '0' }
});

let output = '';
child.stdout.on('data', (data) => {
  output += data.toString();
});

child.stderr.on('data', (data) => {
  output += data.toString();
});

child.on('error', (err) => {
  console.log('   ❌ 启动失败:', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('   ✅ 正常退出');
  } else {
    console.log('   ❌ 异常退出, 退出码:', code);
  }
  console.log('\n6. 输出日志:');
  console.log(output);
  process.exit(code || 0);
});

// 10秒后自动结束
setTimeout(() => {
  child.kill();
  console.log('\n   ⏰ 超时结束');
  console.log('\n6. 输出日志:');
  console.log(output);
}, 10000);

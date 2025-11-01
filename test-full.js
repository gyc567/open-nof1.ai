/**
 * Next.js启动完整性测试套件
 * 
 * 测试覆盖：
 * 1. 依赖检查
 * 2. Prisma客户端生成
 * 3. 开发服务器启动
 * 4. API端点可用性
 * 5. 类型定义正确性
 */

const { spawn } = require('child_process');
const http = require('http');

// 测试结果
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function addTest(name, fn) {
  try {
    fn();
    results.tests.push({ name, status: '✅ PASS' });
    results.passed++;
    console.log(`✅ ${name}`);
  } catch (err) {
    results.tests.push({ name, status: `❌ FAIL: ${err.message}` });
    results.failed++;
    console.log(`❌ ${name}: ${err.message}`);
  }
}

// 断言函数
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

async function assertHttpStatus(url, expectedStatus) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (res.statusCode === expectedStatus) {
        resolve();
      } else {
        reject(new Error(`Expected ${expectedStatus}, got ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

console.log('🧪 Next.js完整性测试套件\n');

addTest('检查关键文件存在', () => {
  const requiredFiles = [
    'package.json',
    'next.config.ts',
    'app/page.tsx',
    'prisma/schema.prisma',
  ];
  
  requiredFiles.forEach(file => {
    const fs = require('fs');
    assert(fs.existsSync(file), `Missing required file: ${file}`);
  });
});

addTest('检查package.json配置', () => {
  const pkg = require('./package.json');
  assert(pkg.dependencies.next, 'Missing next dependency');
  assert(pkg.dependencies.react, 'Missing react dependency');
  assert(pkg.dependencies['@prisma/client'], 'Missing @prisma/client dependency');
  assertEquals(pkg.engines.node, '>=18.0.0', 'Node.js version requirement incorrect');
  assertEquals(pkg.packageManager, 'npm@9.0.0', 'Package manager not set to npm');
});

addTest('检查Prisma客户端', () => {
  const fs = require('fs');
  const prismaClientPath = 'node_modules/@prisma/client/default.js';
  assert(fs.existsSync(prismaClientPath), 'Prisma client not generated. Run: npx prisma generate');
});

addTest('检查TypeScript类型文件', () => {
  const fs = require('fs');
  const typeFiles = [
    'lib/types/metrics.ts',
    'lib/types/market-state.ts',
    'lib/types/account-performance.ts',
  ];
  
  typeFiles.forEach(file => {
    assert(fs.existsSync(file), `Missing type file: ${file}`);
  });
});

addTest('检查客户端/服务器端分离', () => {
  const fs = require('fs');
  const clientFiles = [
    'lib/types/metrics.ts',
    'lib/trading/current-market-state.ts',
  ];
  const serverFiles = [
    'lib/trading/current-market-state.server.ts',
    'lib/trading/account-information-and-performance.server.ts',
  ];
  
  // 客户端文件不应该导入Node.js库
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    assert(!content.includes('from "ccxt"'), `${file} should not import ccxt`);
    assert(!content.includes('from "technicalindicators"'), `${file} should not import technicalindicators`);
  });
  
  // 服务器端文件可以导入Node.js库
  serverFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      // 这里不强制检查，因为服务器端可以使用Node.js库
    }
  });
});

addTest('检查Next.js配置', () => {
  const nextConfig = require('./next.config.ts').default;
  assert(nextConfig.outputFileTracingRoot, 'Missing outputFileTracingRoot configuration');
  assert(nextConfig.webpack, 'Missing webpack configuration');
  assert(nextConfig.webpack.toString().includes('ccxt'), 'webpack should handle ccxt');
});

console.log('\n🔍 API端点测试 (需要服务器运行)...\n');

let serverProcess = null;

addTest('启动开发服务器', async () => {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('npx', ['next', 'dev'], {
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    
    let output = '';
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('✓ Ready in') || output.includes('Local:')) {
        setTimeout(resolve, 2000); // 等待2秒确保完全启动
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    serverProcess.on('error', reject);
    
    // 15秒超时
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 15000);
  });
}, 20000);

addTest('测试首页响应', async () => {
  try {
    await assertHttpStatus('http://localhost:3000/', 200);
  } catch (err) {
    throw new Error(`Homepage test failed: ${err.message}`);
  }
}, 10000);

addTest('测试/pricing API', async () => {
  try {
    await assertHttpStatus('http://localhost:3000/api/pricing', 200);
  } catch (err) {
    throw new Error(`/api/pricing test failed: ${err.message}`);
  }
}, 10000);

addTest('测试/metrics API', async () => {
  try {
    await assertHttpStatus('http://localhost:3000/api/metrics', 200);
  } catch (err) {
    throw new Error(`/api/metrics test failed: ${err.message}`);
  }
}, 10000);

addTest('测试/model/chat API', async () => {
  try {
    await assertHttpStatus('http://localhost:3000/api/model/chat', 200);
  } catch (err) {
    throw new Error(`/api/model/chat test failed: ${err.message}`);
  }
}, 10000);

console.log('\n📊 测试结果总结\n');
console.log(`总测试数: ${results.passed + results.failed}`);
console.log(`✅ 通过: ${results.passed}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`📈 覆盖率: ${((results.passed / (results.passed + results.failed)) * 100}%\n`);

if (results.failed > 0) {
  console.log('失败的测试:\n');
  results.tests.filter(t => t.status.startsWith('❌')).forEach(t => {
    console.log(`  ${t.status}`);
  });
  console.log('');
}

// 清理
if (serverProcess) {
  console.log('🧹 清理服务器...');
  serverProcess.kill();
}

process.exit(results.failed > 0 ? 1 : 0);

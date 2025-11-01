const fs = require('fs');

console.log('🧪 简化测试开始\n');

let passed = 0, failed = 0;

// 检查文件
const files = ['package.json', 'next.config.ts', 'app/page.tsx', 'prisma/schema.prisma', 
              'lib/types/metrics.ts', 'lib/types/market-state.ts',
              'node_modules/@prisma/client/default.js'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    console.log('✅', f);
    passed++;
  } else {
    console.log('❌', f, '- Missing');
    failed++;
  }
});

console.log('\n📊 结果:', passed, '通过,', failed, '失败');
console.log('覆盖率:', (passed/(passed+failed)*100).toFixed(1) + '%');

process.exit(failed > 0 ? 1 : 0);

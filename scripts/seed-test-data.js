const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test data...');

  // Create sample metrics data
  const now = new Date();
  const metrics = [];
  
  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(now.getTime() - (20 - i) * 20000); // Every 20 seconds
    metrics.push({
      name: 'account_metrics',
      model: 'Deepseek',
      metrics: {
        totalValue: 30000 + (i * 100),
        unrealizedPnl: i * 50,
        availableBalance: 15000 + (i * 50),
        positions: [
          {
            symbol: 'BTC/USDT',
            size: 0.5,
            entryPrice: 45000 + (i * 10),
            markPrice: 45100 + (i * 10),
            pnl: i * 25
          }
        ]
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  await prisma.metrics.createMany({
    data: metrics,
  });

  // Create sample chat data
  await prisma.chat.create({
    data: {
      model: 'Deepseek',
      chat: '分析BTC当前技术指标，RSI显示超买信号，建议部分减仓。',
      reasoning: '基于MACD金叉和成交量放大，预计短期上涨趋势延续',
      userPrompt: '分析当前市场状态并提供交易建议',
      tradings: {
        create: {
          symbol: 'BTC',
          opeartion: 'Sell',
          amount: 0.1,
          pricing: 45200,
        },
      },
    },
  });

  console.log('Test data seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

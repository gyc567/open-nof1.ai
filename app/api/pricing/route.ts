import { NextResponse } from "next/server";
import { priceAggregator } from "@/lib/services/price-aggregator";

// Mock data for demo purposes (最终降级方案)
const MOCK_PRICING = {
  btc: {
    current_price: 45234.56,
    current_ema20: 45100.23,
    current_macd: 45.67,
    current_rsi: 58.3,
    open_interest: { latest: 1234567, average: 1200000 },
    funding_rate: 0.0001,
    intraday: {
      mid_prices: Array.from({ length: 10 }, (_, i) => 45200 + i * 5),
      ema_20: Array.from({ length: 10 }, (_, i) => 45100 + i * 3),
      macd: Array.from({ length: 10 }, (_, i) => 40 + i * 0.5),
      rsi_7: Array.from({ length: 10 }, (_, i) => 55 + i * 0.3),
      rsi_14: Array.from({ length: 10 }, (_, i) => 56 + i * 0.2),
    },
    longer_term: {
      ema_20: 44800.34,
      ema_50: 44500.12,
      atr_3: 234.56,
      atr_14: 345.67,
      current_volume: 1234567,
      average_volume: 1100000,
      macd: Array.from({ length: 10 }, (_, i) => 50 + i * 0.8),
      rsi_14: Array.from({ length: 10 }, (_, i) => 57 + i * 0.15),
    },
  },
  eth: {
    current_price: 2567.89,
    current_ema20: 2550.12,
    current_macd: 23.45,
    current_rsi: 62.1,
    open_interest: { latest: 876543, average: 850000 },
    funding_rate: 0.0002,
    intraday: {
      mid_prices: Array.from({ length: 10 }, (_, i) => 2560 + i * 1),
      ema_20: Array.from({ length: 10 }, (_, i) => 2545 + i * 0.8),
      macd: Array.from({ length: 10 }, (_, i) => 20 + i * 0.3),
      rsi_7: Array.from({ length: 10 }, (_, i) => 60 + i * 0.2),
      rsi_14: Array.from({ length: 10 }, (_, i) => 61 + i * 0.1),
    },
    longer_term: {
      ema_20: 2520.34,
      ema_50: 2490.56,
      atr_3: 45.67,
      atr_14: 56.78,
      current_volume: 876543,
      average_volume: 800000,
      macd: Array.from({ length: 10 }, (_, i) => 25 + i * 0.4),
      rsi_14: Array.from({ length: 10 }, (_, i) => 61.5 + i * 0.1),
    },
  },
  sol: {
    current_price: 98.76,
    current_ema20: 97.54,
    current_macd: 1.23,
    current_rsi: 55.5,
    open_interest: { latest: 234567, average: 230000 },
    funding_rate: 0.0001,
    intraday: {
      mid_prices: Array.from({ length: 10 }, (_, i) => 98 + i * 0.1),
      ema_20: Array.from({ length: 10 }, (_, i) => 97.5 + i * 0.05),
      macd: Array.from({ length: 10 }, (_, i) => 1.0 + i * 0.02),
      rsi_7: Array.from({ length: 10 }, (_, i) => 54 + i * 0.15),
      rsi_14: Array.from({ length: 10 }, (_, i) => 55 + i * 0.1),
    },
    longer_term: {
      ema_20: 96.34,
      ema_50: 94.12,
      atr_3: 2.34,
      atr_14: 3.45,
      current_volume: 234567,
      average_volume: 220000,
      macd: Array.from({ length: 10 }, (_, i) => 1.5 + i * 0.05),
      rsi_14: Array.from({ length: 10 }, (_, i) => 55.2 + i * 0.08),
    },
  },
  doge: {
    current_price: 0.08234,
    current_ema20: 0.08156,
    current_macd: 0.00045,
    current_rsi: 52.3,
    open_interest: { latest: 123456, average: 120000 },
    funding_rate: 0.0001,
    intraday: {
      mid_prices: Array.from({ length: 10 }, (_, i) => 0.082 + i * 0.0001),
      ema_20: Array.from({ length: 10 }, (_, i) => 0.0815 + i * 0.00005),
      macd: Array.from({ length: 10 }, (_, i) => 0.0004 + i * 0.00001),
      rsi_7: Array.from({ length: 10 }, (_, i) => 51 + i * 0.13),
      rsi_14: Array.from({ length: 10 }, (_, i) => 52 + i * 0.08),
    },
    longer_term: {
      ema_20: 0.08089,
      ema_50: 0.07934,
      atr_3: 0.00123,
      atr_14: 0.00189,
      current_volume: 123456,
      average_volume: 115000,
      macd: Array.from({ length: 10 }, (_, i) => 0.0005 + i * 0.00002),
      rsi_14: Array.from({ length: 10 }, (_, i) => 52.1 + i * 0.05),
    },
  },
  bnb: {
    current_price: 321.45,
    current_ema20: 319.87,
    current_macd: 2.34,
    current_rsi: 59.2,
    open_interest: { latest: 345678, average: 340000 },
    funding_rate: 0.0001,
    intraday: {
      mid_prices: Array.from({ length: 10 }, (_, i) => 321 + i * 0.2),
      ema_20: Array.from({ length: 10 }, (_, i) => 319.8 + i * 0.15),
      macd: Array.from({ length: 10 }, (_, i) => 2.0 + i * 0.03),
      rsi_7: Array.from({ length: 10 }, (_, i) => 58 + i * 0.12),
      rsi_14: Array.from({ length: 10 }, (_, i) => 59 + i * 0.08),
    },
    longer_term: {
      ema_20: 317.56,
      ema_50: 314.23,
      atr_3: 4.56,
      atr_14: 6.78,
      current_volume: 345678,
      average_volume: 330000,
      macd: Array.from({ length: 10 }, (_, i) => 2.5 + i * 0.06),
      rsi_14: Array.from({ length: 10 }, (_, i) => 59.1 + i * 0.05),
    },
  },
};

/**
 * 将聚合器数据转换为标准响应格式
 */
function transformAggregatedData(
  aggregatedData: any,
  source: string
): any {
  const { btc, eth, sol, bnb, doge } = aggregatedData;

  return {
    btc: {
      current_price: btc.current_price,
      current_ema20: btc.current_price * 0.999, // 模拟EMA值
      current_macd: btc.current_price * 0.001, // 模拟MACD值
      current_rsi: 50 + (btc.price_change_percentage_24h / 10), // 模拟RSI值
      open_interest: { latest: btc.volume * 0.1, average: btc.volume * 0.09 },
      funding_rate: 0.0001,
      intraday: {
        mid_prices: Array.from({ length: 10 }, (_, i) => 
          btc.current_price * (1 + (i - 5) * 0.0001)
        ),
        ema_20: Array.from({ length: 10 }, (_, i) => 
          btc.current_price * (0.998 + i * 0.0002)
        ),
        macd: Array.from({ length: 10 }, (_, i) => 
          btc.current_price * (0.001 + i * 0.0001)
        ),
        rsi_7: Array.from({ length: 10 }, (_, i) => 50 + i * 0.5),
        rsi_14: Array.from({ length: 10 }, (_, i) => 52 + i * 0.3),
      },
      longer_term: {
        ema_20: btc.current_price * 0.997,
        ema_50: btc.current_price * 0.995,
        atr_3: btc.current_price * 0.005,
        atr_14: btc.current_price * 0.008,
        current_volume: btc.volume,
        average_volume: btc.volume * 0.9,
        macd: Array.from({ length: 10 }, (_, i) => btc.current_price * (0.001 + i * 0.0002)),
        rsi_14: Array.from({ length: 10 }, (_, i) => 54 + i * 0.4),
      },
    },
    eth: {
      current_price: eth.current_price,
      current_ema20: eth.current_price * 0.999,
      current_macd: eth.current_price * 0.001,
      current_rsi: 50 + (eth.price_change_percentage_24h / 10),
      open_interest: { latest: eth.volume * 0.1, average: eth.volume * 0.09 },
      funding_rate: 0.0002,
      intraday: {
        mid_prices: Array.from({ length: 10 }, (_, i) => 
          eth.current_price * (1 + (i - 5) * 0.0001)
        ),
        ema_20: Array.from({ length: 10 }, (_, i) => 
          eth.current_price * (0.998 + i * 0.0002)
        ),
        macd: Array.from({ length: 10 }, (_, i) => 
          eth.current_price * (0.001 + i * 0.0001)
        ),
        rsi_7: Array.from({ length: 10 }, (_, i) => 50 + i * 0.5),
        rsi_14: Array.from({ length: 10 }, (_, i) => 52 + i * 0.3),
      },
      longer_term: {
        ema_20: eth.current_price * 0.997,
        ema_50: eth.current_price * 0.995,
        atr_3: eth.current_price * 0.005,
        atr_14: eth.current_price * 0.008,
        current_volume: eth.volume,
        average_volume: eth.volume * 0.9,
        macd: Array.from({ length: 10 }, (_, i) => eth.current_price * (0.001 + i * 0.0002)),
        rsi_14: Array.from({ length: 10 }, (_, i) => 54 + i * 0.4),
      },
    },
    sol: {
      current_price: sol.current_price,
      current_ema20: sol.current_price * 0.999,
      current_macd: sol.current_price * 0.001,
      current_rsi: 50 + (sol.price_change_percentage_24h / 10),
      open_interest: { latest: sol.volume * 0.1, average: sol.volume * 0.09 },
      funding_rate: 0.0001,
      intraday: {
        mid_prices: Array.from({ length: 10 }, (_, i) => 
          sol.current_price * (1 + (i - 5) * 0.0001)
        ),
        ema_20: Array.from({ length: 10 }, (_, i) => 
          sol.current_price * (0.998 + i * 0.0002)
        ),
        macd: Array.from({ length: 10 }, (_, i) => 
          sol.current_price * (0.001 + i * 0.0001)
        ),
        rsi_7: Array.from({ length: 10 }, (_, i) => 50 + i * 0.5),
        rsi_14: Array.from({ length: 10 }, (_, i) => 52 + i * 0.3),
      },
      longer_term: {
        ema_20: sol.current_price * 0.997,
        ema_50: sol.current_price * 0.995,
        atr_3: sol.current_price * 0.005,
        atr_14: sol.current_price * 0.008,
        current_volume: sol.volume,
        average_volume: sol.volume * 0.9,
        macd: Array.from({ length: 10 }, (_, i) => sol.current_price * (0.001 + i * 0.0002)),
        rsi_14: Array.from({ length: 10 }, (_, i) => 54 + i * 0.4),
      },
    },
    doge: {
      current_price: doge.current_price,
      current_ema20: doge.current_price * 0.999,
      current_macd: doge.current_price * 0.001,
      current_rsi: 50 + (doge.price_change_percentage_24h / 10),
      open_interest: { latest: doge.volume * 0.1, average: doge.volume * 0.09 },
      funding_rate: 0.0001,
      intraday: {
        mid_prices: Array.from({ length: 10 }, (_, i) => 
          doge.current_price * (1 + (i - 5) * 0.0001)
        ),
        ema_20: Array.from({ length: 10 }, (_, i) => 
          doge.current_price * (0.998 + i * 0.0002)
        ),
        macd: Array.from({ length: 10 }, (_, i) => 
          doge.current_price * (0.001 + i * 0.0001)
        ),
        rsi_7: Array.from({ length: 10 }, (_, i) => 50 + i * 0.5),
        rsi_14: Array.from({ length: 10 }, (_, i) => 52 + i * 0.3),
      },
      longer_term: {
        ema_20: doge.current_price * 0.997,
        ema_50: doge.current_price * 0.995,
        atr_3: doge.current_price * 0.005,
        atr_14: doge.current_price * 0.008,
        current_volume: doge.volume,
        average_volume: doge.volume * 0.9,
        macd: Array.from({ length: 10 }, (_, i) => doge.current_price * (0.001 + i * 0.0002)),
        rsi_14: Array.from({ length: 10 }, (_, i) => 54 + i * 0.4),
      },
    },
    bnb: {
      current_price: bnb.current_price,
      current_ema20: bnb.current_price * 0.999,
      current_macd: bnb.current_price * 0.001,
      current_rsi: 50 + (bnb.price_change_percentage_24h / 10),
      open_interest: { latest: bnb.volume * 0.1, average: bnb.volume * 0.09 },
      funding_rate: 0.0001,
      intraday: {
        mid_prices: Array.from({ length: 10 }, (_, i) => 
          bnb.current_price * (1 + (i - 5) * 0.0001)
        ),
        ema_20: Array.from({ length: 10 }, (_, i) => 
          bnb.current_price * (0.998 + i * 0.0002)
        ),
        macd: Array.from({ length: 10 }, (_, i) => 
          bnb.current_price * (0.001 + i * 0.0001)
        ),
        rsi_7: Array.from({ length: 10 }, (_, i) => 50 + i * 0.5),
        rsi_14: Array.from({ length: 10 }, (_, i) => 52 + i * 0.3),
      },
      longer_term: {
        ema_20: bnb.current_price * 0.997,
        ema_50: bnb.current_price * 0.995,
        atr_3: bnb.current_price * 0.005,
        atr_14: bnb.current_price * 0.008,
        current_volume: bnb.volume,
        average_volume: bnb.volume * 0.9,
        macd: Array.from({ length: 10 }, (_, i) => bnb.current_price * (0.001 + i * 0.0002)),
        rsi_14: Array.from({ length: 10 }, (_, i) => 54 + i * 0.4),
      },
    },
  };
}

export const GET = async () => {
  const startTime = Date.now();
  
  try {
    console.log("\n" + "=".repeat(70));
    console.log("📊 Fetching aggregated cryptocurrency prices...");
    console.log("=".repeat(70));
    console.log("🔄 Data source priority:");
    console.log("   1. Binance API (实时价格)");
    console.log("   2. CoinGecko API (备用)");
    console.log("   3. Local Cache (最终降级)");
    
    // 使用价格聚合器获取数据
    const aggregatedData = await priceAggregator.getAggregatedPrices();
    
    // 转换数据格式以兼容现有前端
    const pricing = transformAggregatedData(aggregatedData, aggregatedData.source);
    
    const latency = Date.now() - startTime;
    
    console.log("\n✅ Successfully fetched aggregated prices:");
    console.log(`   Data Source: ${aggregatedData.source}`);
    console.log(`   Latency: ${latency}ms`);
    console.log(`   BTC: $${pricing.btc.current_price.toLocaleString()}`);
    console.log(`   ETH: $${pricing.eth.current_price.toLocaleString()}`);
    console.log(`   SOL: $${pricing.sol.current_price.toFixed(2)}`);
    console.log(`   BNB: $${pricing.bnb.current_price.toFixed(2)}`);
    console.log(`   DOGE: $${pricing.doge.current_price.toFixed(4)}`);
    
    // 获取健康状态
    const healthStatus = priceAggregator.getHealthStatus();
    
    console.log("\n📊 Data Source Health Status:");
    Object.entries(healthStatus).forEach(([source, health]: [string, any]) => {
      const status = health.isHealthy ? '✅' : '❌';
      const latency = health.averageLatency?.toFixed(0) || 'N/A';
      console.log(`   ${source}: ${status} (${latency}ms, errors: ${health.errorCount})`);
    });

    return NextResponse.json({
      data: {
        pricing,
        source: aggregatedData.source,
        timestamp: new Date().toISOString(),
        latency: aggregatedData.latency,
        health: healthStatus,
      },
      success: true,
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    
    console.error("\n❌ Error fetching aggregated prices:", error);
    console.log(`⏱️ Request failed after ${latency}ms`);
    console.log("📊 Falling back to mock pricing data...");
    
    // 构造聚合器格式的mock数据进行转换
    const mockAggregatedData = {
      btc: { current_price: 45234.56, price_change_percentage_24h: 2.5, volume: 1234567 },
      eth: { current_price: 2567.89, price_change_percentage_24h: 1.8, volume: 876543 },
      sol: { current_price: 98.76, price_change_percentage_24h: 3.2, volume: 234567 },
      bnb: { current_price: 321.45, price_change_percentage_24h: 0.5, volume: 345678 },
      doge: { current_price: 0.08234, price_change_percentage_24h: 5.0, volume: 123456 },
    };
    
    // 使用转换函数确保格式一致
    const mockPricing = transformAggregatedData(mockAggregatedData, "mock");
    
    return NextResponse.json({
      data: {
        pricing: mockPricing,
        source: "mock",
        timestamp: new Date().toISOString(),
        latency,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      success: true,
    });
  }
};

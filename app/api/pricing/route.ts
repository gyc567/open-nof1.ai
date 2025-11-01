import { NextResponse } from "next/server";
import { priceAggregator } from "@/lib/services/price-aggregator";

// Mock data removed - now using dynamic fallback data in catch block

// 类型定义
interface CoinData {
  current_price: number;
  current_ema20: number;
  current_macd: number;
  current_rsi: number;
  open_interest: { latest: number; average: number };
  funding_rate: number;
  intraday: {
    mid_prices: number[];
    ema_20: number[];
    macd: number[];
    rsi_7: number[];
    rsi_14: number[];
  };
  longer_term: {
    ema_20: number;
    ema_50: number;
    atr_3: number;
    atr_14: number;
    current_volume: number;
    average_volume: number;
    macd: number[];
    rsi_14: number[];
  };
}

interface PricingResponse {
  btc: CoinData;
  eth: CoinData;
  sol: CoinData;
  bnb: CoinData;
  doge: CoinData;
}

/**
 * 将聚合器数据转换为标准响应格式
 */
function transformAggregatedData(
  aggregatedData: Record<string, unknown>
): PricingResponse {
  const { btc, eth, sol, bnb, doge } = aggregatedData as Record<string, Record<string, number>>;

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
    const pricing = transformAggregatedData(
      aggregatedData as unknown as Record<string, unknown>
    );
    
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
    Object.entries(healthStatus).forEach(([source, health]) => {
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

  } catch (err) {
    const latency = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);

    console.error("\n❌ Error fetching aggregated prices:", err);
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
    const mockPricing = transformAggregatedData(mockAggregatedData);
    
    return NextResponse.json({
      data: {
        pricing: mockPricing,
        source: "mock",
        timestamp: new Date().toISOString(),
        latency,
        error: errorMessage,
      },
      success: true,
    });
  }
};

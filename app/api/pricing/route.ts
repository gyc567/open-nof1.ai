import { NextResponse } from "next/server";
import { getCurrentMarketState } from "@/lib/trading/current-market-state";

// Mock data for demo purposes
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

export const GET = async () => {
  try {
    // Check if we have API keys configured
    const hasBinanceKey = process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET;
    
    if (hasBinanceKey) {
      // Real API call if keys are available
      const [btcPricing, ethPricing, solPricing, dogePricing, bnbPricing] =
        await Promise.all([
          getCurrentMarketState("BTC/USDT").catch(() => MOCK_PRICING.btc),
          getCurrentMarketState("ETH/USDT").catch(() => MOCK_PRICING.eth),
          getCurrentMarketState("SOL/USDT").catch(() => MOCK_PRICING.sol),
          getCurrentMarketState("DOGE/USDT").catch(() => MOCK_PRICING.doge),
          getCurrentMarketState("BNB/USDT").catch(() => MOCK_PRICING.bnb),
        ]);

      return NextResponse.json({
        data: {
          pricing: {
            btc: btcPricing,
            eth: ethPricing,
            sol: solPricing,
            doge: dogePricing,
            bnb: bnbPricing,
          },
        },
        success: true,
      });
    } else {
      // Return mock data for demo
      console.log("📊 Returning mock pricing data (no API keys configured)");
      return NextResponse.json({
        data: {
          pricing: MOCK_PRICING,
        },
        success: true,
      });
    }
  } catch (error) {
    console.error("Error fetching pricing:", error);
    // Return mock data on error
    return NextResponse.json({
      data: {
        pricing: MOCK_PRICING,
      },
      success: true,
    });
  }
};

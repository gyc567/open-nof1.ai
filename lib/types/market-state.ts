// 客户端安全的MarketState类型定义
export interface MarketState {
  // Current indicators
  current_price: number;
  current_ema20: number;
  current_macd: number;
  current_rsi: number;

  // Open Interest
  open_interest: {
    latest: number;
    average: number;
  };

  // Funding Rate
  funding_rate: number;

  // Intraday series (by minute)
  intraday: {
    mid_prices: number[];
    ema_20: number[];
    macd: number[];
    rsi_7: number[];
    rsi_14: number[];
  };

  // Longer-term context (4-hour timeframe)
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

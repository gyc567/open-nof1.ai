// 客户端类型定义，避免Node.js依赖
export interface Position {
  symbol: string;
  contracts: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
}

export interface MetricData {
  positions: Position[];
  sharpeRatio: number | null;
  availableCash: number;
  contractValue: number;
  totalCashValue: number;
  currentTotalReturn: number | null;
  currentPositionsValue: number;
  createdAt: string;
}

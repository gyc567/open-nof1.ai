// 客户端安全的AccountInformationAndPerformance类型定义
export interface AccountInformationAndPerformance {
  currentPositionsValue: number;
  contractValue: number;
  totalCashValue: number;
  availableCash: number;
  currentTotalReturn: number;
  positions: Position[];
  sharpeRatio: number;
}

export interface Position {
  symbol: string;
  contracts: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
  side: string;
  notional?: number;
  liquidationPrice?: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
}

import { binance } from "./binance";

export interface RiskLimits {
  maxPositionSize: number;
  maxLeverage: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxDailyLoss: number;
}

export interface RiskCheckResult {
  passed: boolean;
  error?: string;
  adjustedAmount?: number;
}

/**
 * Default risk limits
 */
export const DEFAULT_RISK_LIMITS: RiskLimits = {
  maxPositionSize: 1000, // $1000 max position
  maxLeverage: 10, // 10x max leverage
  stopLossPercentage: 5, // 5% stop loss
  takeProfitPercentage: 10, // 10% take profit
  maxDailyLoss: 500, // $500 max daily loss
};

/**
 * Check if a buy order meets risk management criteria
 */
export async function checkBuyRisk({
  symbol,
  amount,
  leverage,
  price,
  riskLimits = DEFAULT_RISK_LIMITS,
}: {
  symbol: string;
  amount: number;
  leverage: number;
  price: number;
  riskLimits?: RiskLimits;
}): Promise<RiskCheckResult> {
  try {
    const positionValue = amount * price;

    // Check max position size
    if (positionValue > riskLimits.maxPositionSize) {
      const adjustedAmount = riskLimits.maxPositionSize / price;
      return {
        passed: false,
        error: `Position size $${positionValue} exceeds limit $${riskLimits.maxPositionSize}`,
        adjustedAmount,
      };
    }

    // Check max leverage
    if (leverage > riskLimits.maxLeverage) {
      return {
        passed: false,
        error: `Leverage ${leverage}x exceeds limit ${riskLimits.maxLeverage}x`,
      };
    }

    // Check account balance
    const balance = await binance.fetchBalance({ type: "future" });
    const availableBalance = balance.USDT.free || 0;

    if (positionValue / leverage > availableBalance) {
      return {
        passed: false,
        error: `Insufficient margin: Required ${positionValue / leverage}, Available ${availableBalance}`,
      };
    }

    return { passed: true };
  } catch (error) {
    return {
      passed: false,
      error: error instanceof Error ? error.message : "Risk check failed",
    };
  }
}

/**
 * Calculate recommended stop loss and take profit prices
 */
export function calculateStopLossTakeProfit(
  entryPrice: number,
  leverage: number,
  riskLimits = DEFAULT_RISK_LIMITS
): {
  stopLoss: number;
  takeProfit: number;
} {
  const stopLossPercentage = riskLimits.stopLossPercentage / 100;
  const takeProfitPercentage = riskLimits.takeProfitPercentage / 100;

  // For long positions
  const stopLoss = entryPrice * (1 - stopLossPercentage / leverage);
  const takeProfit = entryPrice * (1 + takeProfitPercentage / leverage);

  return {
    stopLoss: Number(stopLoss.toFixed(2)),
    takeProfit: Number(takeProfit.toFixed(2)),
  };
}

/**
 * Check daily loss limit
 */
export async function checkDailyLossLimit(
  initialCapital: number,
  currentCapital: number,
  riskLimits = DEFAULT_RISK_LIMITS
): Promise<RiskCheckResult> {
  const dailyLoss = initialCapital - currentCapital;

  if (dailyLoss > riskLimits.maxDailyLoss) {
    return {
      passed: false,
      error: `Daily loss $${dailyLoss} exceeds limit $${riskLimits.maxDailyLoss}`,
    };
  }

  return { passed: true };
}

/**
 * Get current portfolio risk metrics
 */
export async function getPortfolioRisk(): Promise<{
  totalExposure: number;
  leverage: number;
  unrealizedPnL: number;
}> {
  const positions = await binance.fetchPositions(["BTC/USDT", "ETH/USDT"]);
  
  const totalExposure = positions.reduce((sum, pos) => {
    return sum + (pos.notional || 0);
  }, 0);

  const totalMargin = positions.reduce((sum, pos) => {
    return sum + (pos.initialMargin || 0);
  }, 0);

  const leverage = totalMargin > 0 ? totalExposure / totalMargin : 0;

  const unrealizedPnL = positions.reduce((sum, pos) => {
    return sum + (pos.unrealizedPnl || 0);
  }, 0);

  return {
    totalExposure,
    leverage,
    unrealizedPnL,
  };
}

import { binance } from "./binance";
import type { AccountInformationAndPerformance as AccountType } from "@/lib/types/account-performance";

export async function getAccountInformationAndPerformance(
  initialCapital: number
): Promise<AccountType> {
  const ccxtPositions = await binance.fetchPositions(["BTC/USDT"]);
  const positions = ccxtPositions.map(pos => ({
    symbol: pos.symbol,
    contracts: pos.contracts || 0,
    entryPrice: pos.entryPrice || 0,
    markPrice: pos.markPrice || 0,
    unrealizedPnl: pos.unrealizedPnl || 0,
    leverage: pos.leverage || 0,
    side: pos.side || 'neutral',
    notional: pos.notional,
    liquidationPrice: pos.liquidationPrice,
    stopLossPrice: pos.stopLossPrice,
    takeProfitPrice: pos.takeProfitPrice,
  }));

  const currentPositionsValue = positions.reduce((acc, position) => {
    return acc + (position.unrealizedPnl || 0);
  }, 0);
  const contractValue = positions.reduce((acc, position) => {
    return acc + (position.notional || 0);
  }, 0);
  const currentCashValue = await binance.fetchBalance({ type: "future" });
  const totalCashValue = currentCashValue.USDT.total || 0;
  const availableCash = currentCashValue.USDT.free || 0;
  const currentTotalReturn = initialCapital > 0 ? (totalCashValue - initialCapital) / initialCapital : 0;
  const sharpeRatio = currentTotalReturn !== 0 ? Math.abs(currentTotalReturn) / Math.abs(currentTotalReturn) : 0;

  return {
    currentPositionsValue,
    contractValue,
    totalCashValue,
    availableCash,
    currentTotalReturn,
    positions,
    sharpeRatio,
  };
}

export function formatAccountPerformance(
  accountPerformance: AccountType
) {
  const { currentTotalReturn, availableCash, totalCashValue, positions } =
    accountPerformance;

  const output = `## HERE IS YOUR ACCOUNT INFORMATION & PERFORMANCE
Current Total Return (percent): ${currentTotalReturn * 100}%
Available Cash: ${availableCash}
Current Account Value: ${totalCashValue}
Positions: ${positions
    .map((position) =>
      JSON.stringify({
        symbol: position.symbol,
        quantity: position.contracts,
        entry_price: position.entryPrice,
        current_price: position.markPrice,
        liquidation_price: position.liquidationPrice,
        unrealized_pnl: position.unrealizedPnl,
        leverage: position.leverage,
        notional_usd: position.notional,
        side: position.side,
        stopLoss: position.stopLossPrice,
        takeProfit: position.takeProfitPrice,
      })
    )
    .join("\n")}`;
  return output;
}

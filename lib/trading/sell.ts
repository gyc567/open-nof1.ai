import { binance } from "./binance";
import { withRetry, isRetryableError } from "../utils/retry";

export interface SellOrderParams {
  symbol: string;
  percentage: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface SellOrderResult {
  success: boolean;
  orderId?: string;
  price?: number;
  amount?: number;
  error?: string;
}

/**
 * Execute a sell order on Binance Futures
 * Percentage: 0-100, representing percentage of position to sell
 */
export async function sell({
  symbol,
  percentage,
  stopLoss,
  takeProfit,
}: SellOrderParams): Promise<SellOrderResult> {
  try {
    const normalizedSymbol = symbol.includes("/") ? symbol : `${symbol}/USDT`;

    // Get current positions
    const positions = await withRetry(
      () => binance.fetchPositions([normalizedSymbol]),
      {
        retryCondition: isRetryableError,
        maxAttempts: 3,
      }
    ) as any;

    const position = positions.find(
      (p: any) => p.symbol === normalizedSymbol && p.contracts && p.contracts > 0
    );

    if (!position || !position.contracts) {
      return {
        success: false,
        error: `No position found for ${symbol}`,
      };
    }

    // Calculate amount to sell based on percentage
    const amountToSell = (position.contracts * percentage) / 100;

    // Execute sell with retry
    const result = await withRetry(
      async () => {
        // Create market sell order
        const order = await binance.createMarketSellOrder(
          normalizedSymbol,
          amountToSell
        );

        // Set stop loss if provided and still have remaining position
        if (stopLoss && percentage < 100) {
          await binance.createOrder(
            normalizedSymbol,
            "stop",
            "sell",
            position.contracts - amountToSell,
            stopLoss,
            {
              stopPrice: stopLoss,
            }
          );
        }

        // Set take profit if provided and still have remaining position
        if (takeProfit && percentage < 100) {
          await binance.createOrder(
            normalizedSymbol,
            "takeProfit",
            "sell",
            position.contracts - amountToSell,
            takeProfit,
            {
              stopPrice: takeProfit,
            }
          );
        }

        return {
          success: true,
          orderId: order.id,
          price: order.price,
          amount: order.amount,
        };
      },
      {
        retryCondition: isRetryableError,
        maxAttempts: 3,
        delayMs: 2000,
      }
    );

    return result;
  } catch (error) {
    console.error("Sell order failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

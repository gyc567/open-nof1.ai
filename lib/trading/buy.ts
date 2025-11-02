import { binance } from "./binance";
import { checkBuyRisk, calculateStopLossTakeProfit } from "./risk-management";
import { withRetry, isRetryableError } from "../utils/retry";

export interface BuyOrderParams {
  symbol: string;
  amount: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface BuyOrderResult {
  success: boolean;
  orderId?: string;
  price?: number;
  amount?: number;
  error?: string;
}

/**
 * Execute a buy order on Binance Futures
 */
export async function buy({
  symbol,
  amount,
  leverage = 1,
  stopLoss,
  takeProfit,
}: BuyOrderParams): Promise<BuyOrderResult> {
  try {
    const normalizedSymbol = symbol.includes("/") ? symbol : `${symbol}/USDT`;

    // Get current price for risk calculation
    const ticker = await withRetry(
      () => binance.fetchTicker(normalizedSymbol),
      {
        retryCondition: isRetryableError,
        maxAttempts: 3,
      }
    ) as any;
    const currentPrice = ticker.last || 0;

    if (currentPrice === 0) {
      return {
        success: false,
        error: "Could not fetch current price",
      };
    }

    // Check risk management
    const riskCheck = await checkBuyRisk({
      amount,
      leverage,
      price: currentPrice,
    });

    if (!riskCheck.passed) {
      return {
        success: false,
        error: riskCheck.error,
      };
    }

    // Adjust amount if risk check suggests it
    const finalAmount = riskCheck.adjustedAmount || amount;

    // Execute trades with retry
    const result = await withRetry(
      async () => {
        // Set leverage first
        await binance.setLeverage(normalizedSymbol, Number(leverage));

        // Create market buy order
        const order = await binance.createMarketBuyOrder(normalizedSymbol, Number(finalAmount));

        // Calculate stop loss and take profit if not provided
        const finalStopLoss = stopLoss || calculateStopLossTakeProfit(currentPrice, leverage).stopLoss;
        const finalTakeProfit = takeProfit || calculateStopLossTakeProfit(currentPrice, leverage).takeProfit;

        // Set stop loss
        await binance.createOrder(
          normalizedSymbol,
          "stop",
          "sell",
          finalAmount,
          finalStopLoss,
          {
            stopPrice: finalStopLoss,
          }
        );

        // Set take profit
        await binance.createOrder(
          normalizedSymbol,
          "takeProfit",
          "sell",
          finalAmount,
          finalTakeProfit,
          {
            stopPrice: finalTakeProfit,
          }
        );

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
    console.error("Buy order failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

import { generateObject } from "ai";
import { generateUserPrompt, tradingPrompt } from "./prompt";
import { getCurrentMarketState } from "../trading/current-market-state";
import { z } from "zod";
import { deepseekR1 } from "./model";
import { getAccountInformationAndPerformance } from "../trading/account-information-and-performance";
import { prisma } from "../prisma";
import { Opeartion, Symbol } from "@prisma/client";
import { buy } from "../trading/buy";
import { sell } from "../trading/sell";

/**
 * you can interval trading using cron job
 */
export async function run(initialCapital: number) {
  const currentMarketState = await getCurrentMarketState("BTC/USDT");
  const accountInformationAndPerformance =
    await getAccountInformationAndPerformance(initialCapital);
  // Count previous Chat entries to provide an invocation counter in the prompt
  const invocationCount = await prisma.chat.count();

  const userPrompt = generateUserPrompt({
    currentMarketState,
    accountInformationAndPerformance,
    startTime: new Date(),
    invocationCount,
  });

  const { object, reasoning } = await generateObject({
    model: deepseekR1,
    system: tradingPrompt,
    prompt: userPrompt,
    output: "object",
    mode: "json",
    schema: z.object({
      opeartion: z.nativeEnum(Opeartion),
      buy: z
        .object({
          pricing: z.number().describe("The pricing of you want to buy in."),
          amount: z.number(),
          leverage: z.number().min(1).max(20),
        })
        .optional()
        .describe("If opeartion is buy, generate object"),
      sell: z
        .object({
          percentage: z
            .number()
            .min(0)
            .max(100)
            .describe("Percentage of position to sell"),
        })
        .optional()
        .describe("If opeartion is sell, generate object"),
      adjustProfit: z
        .object({
          stopLoss: z
            .number()
            .optional()
            .describe("The stop loss of you want to set."),
          takeProfit: z
            .number()
            .optional()
            .describe("The take profit of you want to set."),
        })
        .optional()
        .describe(
          "If opeartion is hold and you want to adjust the profit, generate object"
        ),
      chat: z
        .string()
        .describe(
          "The reason why you do this opeartion, and tell me your anlyaise, for example: Currently holding all my positions in ETH, SOL, XRP, BTC, DOGE, and BNB as none of my invalidation conditions have been triggered, though XRP and BNB are showing slight unrealized losses. My overall account is up 10.51% with $4927.64 in cash, so I'll continue to monitor my existing trades."
        ),
    }),
  });

  if (object.opeartion === Opeartion.Buy && object.buy) {
    const buyResult = await buy({
      symbol: "BTC",
      amount: object.buy.amount,
      leverage: object.buy.leverage,
      stopLoss: object.adjustProfit?.stopLoss,
      takeProfit: object.adjustProfit?.takeProfit,
    });

    await prisma.chat.create({
      data: {
        reasoning: reasoning || "<no reasoning>",
        chat: object.chat || "<no chat>",
        userPrompt,
        tradings: {
          createMany: {
            data: {
              symbol: Symbol.BTC,
              opeartion: object.opeartion,
              pricing: buyResult.price || object.buy?.pricing,
              amount: buyResult.amount || object.buy?.amount,
              leverage: object.buy?.leverage,
            },
          },
        },
      },
    });

    return buyResult;
  }

  if (object.opeartion === Opeartion.Sell) {
    const sellResult = await sell({
      symbol: "BTC",
      percentage: object.sell?.percentage || 100,
      stopLoss: object.adjustProfit?.stopLoss,
      takeProfit: object.adjustProfit?.takeProfit,
    });

    await prisma.chat.create({
      data: {
        reasoning: reasoning || "<no reasoning>",
        chat: object.chat || "<no chat>",
        userPrompt,
        tradings: {
          createMany: {
            data: {
              symbol: Symbol.BTC,
              opeartion: object.opeartion,
              pricing: sellResult.price,
              amount: sellResult.amount,
            },
          },
        },
      },
    });

    return sellResult;
  }

  if (object.opeartion === Opeartion.Hold) {
    const shouldAdjustProfit =
      object.adjustProfit?.stopLoss && object.adjustProfit?.takeProfit;
    await prisma.chat.create({
      data: {
        reasoning: reasoning || "<no reasoning>",
        chat: object.chat || "<no chat>",
        userPrompt,
        tradings: {
          createMany: {
            data: {
              symbol: Symbol.BTC,
              opeartion: object.opeartion,
              stopLoss: shouldAdjustProfit
                ? object.adjustProfit?.stopLoss
                : undefined,
              takeProfit: shouldAdjustProfit
                ? object.adjustProfit?.takeProfit
                : undefined,
            },
          },
        },
      },
    });
  }
}

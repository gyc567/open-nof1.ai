/**
 * CoinGecko API 调用函数
 * 获取免费实时加密货币价格数据
 */

import axios, { AxiosRequestConfig } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getProxyUrl, isProxyEnabled } from "@/lib/utils/proxy-config";

// CoinGecko API 端点
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";

/**
 * 获取axios配置，支持条件性代理
 * @returns AxiosRequestConfig axios配置对象
 */
function getAxiosConfig(): AxiosRequestConfig {
  const config: AxiosRequestConfig = {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    timeout: 5000,
  };
  
  // 只有启用代理且存在代理URL时才配置代理
  if (isProxyEnabled()) {
    const proxyUrl = getProxyUrl();
    if (proxyUrl) {
      // @ts-expect-error
      config.httpAgent = new HttpsProxyAgent(proxyUrl);
      // @ts-expect-error
      config.httpsAgent = new HttpsProxyAgent(proxyUrl);
      console.log(`🔌 Using proxy: ${proxyUrl}`);
    } else {
      console.log(`⚠️ Proxy enabled but no URL configured`);
    }
  } else {
    console.log(`🔌 Direct connection (proxy disabled)`);
  }
  
  return config;
}

// CoinGecko ID 映射
const COIN_IDS = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  bnb: "binancecoin",
  doge: "dogecoin",
};

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

/**
 * 从 CoinGecko API 获取单个币种价格
 */
async function fetchCoinPrice(coinId: string) {
  const response = await fetch(
    `${COINGECKO_API_URL}?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data: CoinGeckoResponse = await response.json();
  const coin = data[coinId];

  if (!coin) {
    throw new Error(`No data for ${coinId}`);
  }

  return {
    price: coin.usd,
    change24h: coin.usd_24h_change || 0,
  };
}

/**
 * 并行获取所有币种价格
 */
export async function fetchAllPrices() {
  const coinIds = Object.values(COIN_IDS);
  
  try {
    const connectionType = isProxyEnabled() && getProxyUrl() 
      ? `proxy (${getProxyUrl()})` 
      : 'direct connection';
    
    console.log(`📡 Fetching prices from CoinGecko via ${connectionType}...`);
    
    const response = await axios.get(
      `${COINGECKO_API_URL}?ids=${coinIds.join(",")}&vs_currencies=usd&include_24hr_change=true&precision=full`,
      {
        ...getAxiosConfig(),
        timeout: 8000,
      }
    );

    if (response.status !== 200) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoResponse = response.data;

    // 转换为标准格式
    return {
      btc: {
        current_price: data[COIN_IDS.btc]?.usd || 0,
        current_ema20: 0, // 技术指标留空，由前端计算或后续添加
        current_macd: 0,
        current_rsi: 0,
        open_interest: { latest: 0, average: 0 },
        funding_rate: 0,
        intraday: {
          mid_prices: Array.from({ length: 10 }, (_, i) => 
            (data[COIN_IDS.btc]?.usd || 0) * (1 + i * 0.001)
          ),
          ema_20: [],
          macd: [],
          rsi_7: [],
          rsi_14: [],
        },
        longer_term: {
          ema_20: 0,
          ema_50: 0,
          atr_3: 0,
          atr_14: 0,
          current_volume: 0,
          average_volume: 0,
          macd: [],
          rsi_14: [],
        },
      },
      eth: {
        current_price: data[COIN_IDS.eth]?.usd || 0,
        current_ema20: 0,
        current_macd: 0,
        current_rsi: 0,
        open_interest: { latest: 0, average: 0 },
        funding_rate: 0,
        intraday: {
          mid_prices: Array.from({ length: 10 }, (_, i) => 
            (data[COIN_IDS.eth]?.usd || 0) * (1 + i * 0.001)
          ),
          ema_20: [],
          macd: [],
          rsi_7: [],
          rsi_14: [],
        },
        longer_term: {
          ema_20: 0,
          ema_50: 0,
          atr_3: 0,
          atr_14: 0,
          current_volume: 0,
          average_volume: 0,
          macd: [],
          rsi_14: [],
        },
      },
      sol: {
        current_price: data[COIN_IDS.sol]?.usd || 0,
        current_ema20: 0,
        current_macd: 0,
        current_rsi: 0,
        open_interest: { latest: 0, average: 0 },
        funding_rate: 0,
        intraday: {
          mid_prices: Array.from({ length: 10 }, (_, i) => 
            (data[COIN_IDS.sol]?.usd || 0) * (1 + i * 0.001)
          ),
          ema_20: [],
          macd: [],
          rsi_7: [],
          rsi_14: [],
        },
        longer_term: {
          ema_20: 0,
          ema_50: 0,
          atr_3: 0,
          atr_14: 0,
          current_volume: 0,
          average_volume: 0,
          macd: [],
          rsi_14: [],
        },
      },
      doge: {
        current_price: data[COIN_IDS.doge]?.usd || 0,
        current_ema20: 0,
        current_macd: 0,
        current_rsi: 0,
        open_interest: { latest: 0, average: 0 },
        funding_rate: 0,
        intraday: {
          mid_prices: Array.from({ length: 10 }, (_, i) => 
            (data[COIN_IDS.doge]?.usd || 0) * (1 + i * 0.001)
          ),
          ema_20: [],
          macd: [],
          rsi_7: [],
          rsi_14: [],
        },
        longer_term: {
          ema_20: 0,
          ema_50: 0,
          atr_3: 0,
          atr_14: 0,
          current_volume: 0,
          average_volume: 0,
          macd: [],
          rsi_14: [],
        },
      },
      bnb: {
        current_price: data[COIN_IDS.bnb]?.usd || 0,
        current_ema20: 0,
        current_macd: 0,
        current_rsi: 0,
        open_interest: { latest: 0, average: 0 },
        funding_rate: 0,
        intraday: {
          mid_prices: Array.from({ length: 10 }, (_, i) => 
            (data[COIN_IDS.bnb]?.usd || 0) * (1 + i * 0.001)
          ),
          ema_20: [],
          macd: [],
          rsi_7: [],
          rsi_14: [],
        },
        longer_term: {
          ema_20: 0,
          ema_50: 0,
          atr_3: 0,
          atr_14: 0,
          current_volume: 0,
          average_volume: 0,
          macd: [],
          rsi_14: [],
        },
      },
    };
  } catch (error) {
    console.error("Error fetching from CoinGecko:", error);
    throw error;
  }
}

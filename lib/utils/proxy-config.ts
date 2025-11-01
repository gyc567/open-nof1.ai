/**
 * 代理配置管理模块
 * 
 * 功能：统一管理HTTP代理的读取和配置
 * 遵循KISS原则：高内聚、低耦合、简洁清晰
 */

/**
 * 代理配置接口
 */
interface ProxyConfig {
  enabled: boolean;
  httpProxy?: string;
  httpsProxy?: string;
  allProxy?: string;
  proxyUrl?: string; // 添加proxyUrl字段
}

/**
 * 获取代理配置
 * @returns ProxyConfig 代理配置对象
 * 
 * 逻辑说明：
 * 1. 优先读取HTTP_PROXY_ENABLE环境变量
 * 2. 如果启用，则读取代理URL
 * 3. 支持HTTP_PROXY、HTTPS_PROXY、ALL_PROXY三种格式
 * 4. 默认使用HTTPS_PROXY，备选HTTP_PROXY、ALL_PROXY
 */
export function getProxyConfig(): ProxyConfig {
  // 读取启用标志 - 默认为false（不使用代理）
  const isEnabled = process.env.HTTP_PROXY_ENABLE === 'true';
  
  // 如果未启用，返回禁用配置
  if (!isEnabled) {
    return {
      enabled: false,
    };
  }
  
  // 读取代理URL - 优先级：HTTPS_PROXY > HTTP_PROXY > ALL_PROXY
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const allProxy = process.env.ALL_PROXY || process.env.all_proxy;

  // 优先使用HTTPS代理，其次是HTTP代理，最后是ALL代理
  const proxyUrl = httpsProxy || httpProxy || allProxy;

  return {
    enabled: true,
    httpProxy,
    httpsProxy,
    allProxy,
    proxyUrl, // 添加proxyUrl到返回对象
  };
}

/**
 * 检查是否启用代理
 * @returns boolean 是否启用代理
 */
export function isProxyEnabled(): boolean {
  return getProxyConfig().enabled;
}

/**
 * 获取代理URL
 * @returns string | undefined 代理URL，不启用时返回undefined
 */
export function getProxyUrl(): string | undefined {
  const config = getProxyConfig();
  
  if (!config.enabled) {
    return undefined;
  }
  
  // 优先返回HTTPS_PROXY，备选HTTP_PROXY、ALL_PROXY
  return config.httpsProxy || config.httpProxy || config.allProxy;
}

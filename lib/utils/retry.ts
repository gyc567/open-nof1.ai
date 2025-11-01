/**
 * Retry mechanism for robust API calls
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  retryCondition?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
  retryCondition: () => true,
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt === opts.maxAttempts || !opts.retryCondition(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.delayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelayMs
      );

      console.warn(
        `Attempt ${attempt} failed: ${lastError.message}. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Retry condition for common trading errors
 */
export function isRetryableError(error: Error): boolean {
  const retryableErrors = [
    "NETWORK_ERROR",
    "TIMEOUT",
    "RATE_LIMIT",
    "INSUFFICIENT_BALANCE",
    "MARKET_CLOSED",
    "ServiceUnavailableError",
    "NetworkError",
  ];

  const errorMessage = error.message.toUpperCase();
  return retryableErrors.some((err) => errorMessage.includes(err));
}

/**
 * Execute multiple operations in parallel with retry
 */
export async function withRetryParallel<T>(
  operations: (() => Promise<T>)[],
  options: RetryOptions = {}
): Promise<T[]> {
  return Promise.all(
    operations.map((op) => withRetry(op, options))
  );
}

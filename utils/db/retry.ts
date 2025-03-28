const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

interface RetryOptions {
  retryCount?: number;
  retryDelay?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retryCount = DEFAULT_RETRY_COUNT,
    retryDelay = DEFAULT_RETRY_DELAY,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Only retry on connection errors
      if (error.code !== 'XX000' || !error.message.includes('Max client connections')) {
        throw error;
      }

      if (attempt === retryCount) {
        break;
      }

      if (onRetry) {
        onRetry(error, attempt);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  throw lastError;
} 
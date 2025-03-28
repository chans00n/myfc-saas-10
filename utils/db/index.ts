import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection pool configuration - keeping a minimal pool to prevent connection issues
const POOL_SIZE = 1;
const POOL_IDLE_TIMEOUT = 10; // seconds

let globalPool: ReturnType<typeof postgres> | undefined;

function getConnectionPool() {
  if (!globalPool) {
    globalPool = postgres(process.env.DATABASE_URL!, {
      max: POOL_SIZE,
      idle_timeout: POOL_IDLE_TIMEOUT,
      max_lifetime: 60 * 30, // 30 minutes
      connect_timeout: 10,
    });
  }
  return globalPool;
}

// This is used only for new features that need connection pooling
export function getPooledDB() {
  const pool = getConnectionPool();
  return drizzle(pool, { schema });
}

// Handle cleanup on app shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGTERM', async () => {
    if (globalPool) {
      await globalPool.end();
    }
  });
} 
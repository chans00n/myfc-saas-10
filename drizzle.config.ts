import type { Config } from "drizzle-kit";
import { config } from 'dotenv';

// Load environment variables from the appropriate file
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
} else {
  config({ path: '.env' });
}

export default {
    schema: "./utils/db/schema.ts",
    out: "./utils/db/migrations",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
    },
} satisfies Config;
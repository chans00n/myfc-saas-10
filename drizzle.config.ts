import { defineConfig } from "drizzle-kit";
import { config } from 'dotenv';

// Load environment variables from the appropriate file
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
} else {
  config({ path: '.env' });
}

export default defineConfig({
    schema: "./utils/db/schema.ts",
    out: "./utils/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
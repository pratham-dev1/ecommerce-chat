import "dotenv/config";

import { z } from "zod";

// This schema describes which environment variables the backend expects.
// Values come from process.env, which dotenv fills using backend/.env in local development.
const envSchema = z.object({
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:admin123@127.0.0.1:5432/EcomAndChatDB"),
  JWT_ACCESS_SECRET: z.string().default("change-me-access"),
  JWT_REFRESH_SECRET: z.string().default("change-me-refresh"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PAYMENT_PROVIDER: z.string().default("stripe"),
  PAYMENT_SECRET_KEY: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(5000),
  REDIS_URL: z.string().url().default("redis://127.0.0.1:6379"),
});

// Validate process.env once when the app starts.
// If a value is missing or invalid, defaults are used where provided.
const parsedEnv = envSchema.parse(process.env);

// Export clean, typed names so other files do not use process.env directly.
export const env = {
  clientUrl: parsedEnv.CLIENT_URL,
  databaseUrl: parsedEnv.DATABASE_URL,
  jwtAccessSecret: parsedEnv.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsedEnv.JWT_REFRESH_SECRET,
  nodeEnv: parsedEnv.NODE_ENV,
  paymentProvider: parsedEnv.PAYMENT_PROVIDER,
  paymentSecretKey: parsedEnv.PAYMENT_SECRET_KEY,
  port: parsedEnv.PORT,
  redisUrl: parsedEnv.REDIS_URL,
};

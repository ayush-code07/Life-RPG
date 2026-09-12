import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_SSL: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true' || val === '1'),
  DATABASE_POOL_MIN: z
    .string()
    .optional()
    .default('2')
    .transform((val) => parseInt(val, 10)),
  DATABASE_POOL_MAX: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10)),
  DATABASE_TIMEOUT_MS: z
    .string()
    .optional()
    .default('10000')
    .transform((val) => parseInt(val, 10)),
  SUPABASE_JWT_SECRET: z
    .string()
    .optional()
    .default('')
    .transform((val) => val || process.env.SUPABASE_SECRET_KEY || 'default-dev-secret-key-change-in-production-min-32-chars'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();

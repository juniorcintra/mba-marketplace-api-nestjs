import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  UPLOAD_PATH: z.string(),
  PORT: z.coerce.number().optional().default(3333),
});

export type Env = z.infer<typeof envSchema>;

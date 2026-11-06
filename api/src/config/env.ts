import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.string().min(1, "Falta DATABASE_URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET tiene que tener al menos 32 caracteres"),
  JWT_EXPIRA_EN_SEGUNDOS: z.coerce.number().int().positive().default(28800),
  CORS_ORIGINS: z
  .string()
  .default("http://localhost:5173")
  .transform((valor) => valor.split(",").map((origen) => origen.trim())),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error("Variables de entorno inválidas:");
  for (const issue of resultado.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = resultado.data;
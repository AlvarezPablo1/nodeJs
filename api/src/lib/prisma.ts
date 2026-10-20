import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

// La sesión en UTC: el adapter manda las fechas en UTC sin zona horaria, y si la base usa otra
// (compose.yaml la pone en hora argentina) las interpreta mal y las guarda corridas.
const adapter = new PrismaPg({ connectionString, options: "-c timezone=UTC" });

export const prisma = new PrismaClient({ adapter });
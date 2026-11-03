import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";

export const NOMBRE_COOKIE = "turnero_token";

const payloadSchema = z.object({
  sub: z.uuid(),
  rol: z.enum(["admin", "profesional", "cliente"]),
  profesionalId: z.uuid().nullable(),
  clienteId: z.uuid().nullable(),
});

export type UsuarioAutenticado = z.infer<typeof payloadSchema>;3

export function firmarToken(usuario: UsuarioAutenticado) {
  return jwt.sign(usuario, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRA_EN_SEGUNDOS });
}

export function verificarToken(token: string): UsuarioAutenticado | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const resultado = payloadSchema.safeParse(payload);
    return resultado.success ? resultado.data : null;
  } catch {
    return null;
  }
}
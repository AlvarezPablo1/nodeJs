import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/appError.js";
import { NOMBRE_COOKIE, verificarToken } from "../lib/jwt.js";

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.[NOMBRE_COOKIE];

  if (!token) {
    throw new UnauthorizedError();
  }

  const usuario = verificarToken(token);

  if (!usuario) {
    throw new UnauthorizedError("La sesión es inválida o expiró");
  }

  res.locals.usuario = usuario;
  next();
}
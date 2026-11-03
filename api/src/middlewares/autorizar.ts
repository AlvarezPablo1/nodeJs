import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/appError.js";
import type { UsuarioAutenticado } from "../lib/jwt.js";

export function autorizar(...rolesPermitidos: UsuarioAutenticado["rol"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = res.locals.usuario;

    if (!usuario) {
      throw new UnauthorizedError();
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      throw new ForbiddenError();
    }

    next();
  };
}
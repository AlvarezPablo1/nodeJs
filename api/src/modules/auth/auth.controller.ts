import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { NOMBRE_COOKIE } from "../../lib/jwt.js";
import { responderOk } from "../../shared/respuesta.js";
import { authService } from "./auth.service.js";

const opcionesCookie = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: env.JWT_EXPIRA_EN_SEGUNDOS * 1000,
};

export const authController = {
  async registrar(req: Request, res: Response) {
    responderOk(res, await authService.registrar(req.body), { status: 201 });
  },

  async login(req: Request, res: Response) {
    const { token, usuario } = await authService.login(req.body);
    res.cookie(NOMBRE_COOKIE, token, opcionesCookie);
    responderOk(res, { token, usuario });
  },

  logout(req: Request, res: Response) {
    res.clearCookie(NOMBRE_COOKIE, { ...opcionesCookie, maxAge: undefined });
    responderOk(res, null);
  },

  async yo(req: Request, res: Response) {
    responderOk(res, await authService.obtenerActual(res.locals.usuario!.sub));
  },
};
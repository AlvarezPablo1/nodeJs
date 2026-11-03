import type { UsuarioAutenticado } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Locals {
      usuario?: UsuarioAutenticado;
    }
  }
}

export {};
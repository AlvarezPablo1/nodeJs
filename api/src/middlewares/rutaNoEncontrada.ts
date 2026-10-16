import type { Request, Response } from "express";
import { responderError } from "../shared/respuesta.js";

// Este middleware se encarga de manejar las rutas que no han sido encontradas en el servidor.
export function rutaNoEncontrada(req: Request, res: Response) {
  responderError(res, 404, {
    description: `No existe la ruta ${req.method} ${req.originalUrl}`,
    codigo: "RUTA_NO_ENCONTRADA",
  });
}
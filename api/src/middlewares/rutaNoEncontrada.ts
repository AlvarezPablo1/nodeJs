import type { Request, Response } from "express";

// Este middleware se encarga de manejar las rutas que no han sido encontradas en el servidor.
export function rutaNoEncontrada(req: Request, res: Response) {
  res.status(404).json({
    error: "Ruta no encontrada",
    ruta: `${req.method} ${req.originalUrl}`,
  });
}
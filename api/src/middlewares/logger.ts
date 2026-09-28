import type { Request, Response, NextFunction } from "express";

// Este middleware se encarga de registrar información sobre cada solicitud HTTP que llega al servidor.
export function logger(req: Request, res: Response, next: NextFunction) {
  const inicio = Date.now();

  res.on("finish", () => {
    const duracion = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duracion}ms)`);
  });

  next();
}
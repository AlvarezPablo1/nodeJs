import type { Response } from "express";

export type Meta = Record<string, unknown>;

export type DetalleError = { campo: string; mensaje: string };

export type ErrorRespuesta = {
  description: string;
  codigo?: string;
  detalles?: DetalleError[];
};

function construirMeta(res: Response, status: number, extra: Meta = {}) {
  return {
    endpoint: res.req.originalUrl.split("?")[0],
    metodo: res.req.method,
    status,
    ...extra,
  };
}

export function responderOk(
  res: Response,
  data: unknown,
  opciones: { status?: number; meta?: Meta } = {},
) {
  const status = opciones.status ?? 200;

  res.status(status).json({
    meta: construirMeta(res, status, opciones.meta),
    response: { result: true, data },
    error: null,
  });
}

export function responderNegativo(
  res: Response,
  description: string,
  data: unknown = null,
  opciones: { meta?: Meta } = {},
) {
  res.status(200).json({
    meta: construirMeta(res, 200, opciones.meta),
    response: { result: false, description, data },
    error: null,
  });
}

export function responderError(res: Response, status: number, error: ErrorRespuesta) {
  res.status(status).json({
    meta: construirMeta(res, status),
    response: null,
    error: { status, ...error },
  });
}
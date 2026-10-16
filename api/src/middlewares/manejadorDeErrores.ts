import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/appError.js";
import { responderError } from "../shared/respuesta.js";

export const manejadorDeErrores: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return responderError(res, err.status, { description: err.message, codigo: err.codigo });
  }

  if (err.type === "entity.parse.failed") {
    return responderError(res, 400, { description: "El body no es un JSON válido", codigo: "JSON_INVALIDO" });
  }

  console.error(err);
  responderError(res, 500, { description: "Error interno del servidor", codigo: "ERROR_INTERNO" });
};
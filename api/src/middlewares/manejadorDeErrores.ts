import type { ErrorRequestHandler } from "express";
import { AppError, ReglaDeNegocioError } from "../errors/appError.js";
import { responderError, responderNegativo } from "../shared/respuesta.js";

export const manejadorDeErrores: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return responderError(res, err.status, { description: err.message, codigo: err.codigo });
  }

  if (err.type === "entity.parse.failed") {
    return responderError(res, 400, { description: "El body no es un JSON válido", codigo: "JSON_INVALIDO" });
  }

  if (err instanceof ReglaDeNegocioError) {
    return responderNegativo(res, err.message, { codigo: err.codigo });
  }

  console.error(err);
  responderError(res, 500, { description: "Error interno del servidor", codigo: "ERROR_INTERNO" });
};
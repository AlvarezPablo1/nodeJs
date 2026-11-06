import type { ErrorRequestHandler } from "express";
import { AppError, ReglaDeNegocioError } from "../errors/appError.js";
import { responderError, responderNegativo } from "../shared/respuesta.js";

export const manejadorDeErrores: ErrorRequestHandler = (err, req, res, next) => {
  // Manejo de errores personalizados de la aplicación
  if (err instanceof AppError) {
    return responderError(res, err.status, { description: err.message, codigo: err.codigo });
  }

  // Manejo de errores de análisis de JSON (JSON parse errors)
  if (err.type === "entity.parse.failed") {
    return responderError(res, 400, { description: "El body no es un JSON válido", codigo: "JSON_INVALIDO" });
  }

  // Manejo de errores de tamaño de carga útil (payload) demasiado grande
  if (err.type === "entity.too.large") {
    return responderError(res, 413, {
      description: "El cuerpo de la solicitud es demasiado grande",
      codigo: "PAYLOAD_DEMASIADO_GRANDE",
    });
  }
  // Manejo de errores de reglas de negocio
  if (err instanceof ReglaDeNegocioError) {
    return responderNegativo(res, err.message, { codigo: err.codigo });
  }

  console.error(err);
  responderError(res, 500, { description: "Error interno del servidor", codigo: "ERROR_INTERNO" });
};
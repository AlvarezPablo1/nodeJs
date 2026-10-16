import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { responderError } from "../shared/respuesta.js";

type Schemas = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

// Este middleware se encarga de validar los datos de la solicitud (params, query y body) utilizando esquemas de Zod.
export function validar(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Itera sobre cada parte de la solicitud (params, query y body) y valida los datos utilizando los esquemas proporcionados.
    for (const parte of ["params", "query", "body"] as const) {
      // Obtiene el esquema correspondiente a la parte actual de la solicitud.
      const schema = schemas[parte];
      // Si no hay un esquema definido para esta parte de la solicitud, continúa con la siguiente iteración.
      if (!schema) continue;

      // Valida los datos de la parte correspondiente de la solicitud utilizando el esquema de Zod.
      const resultado = schema.safeParse(req[parte]);

      // Si la validación falla, devuelve un error 400 con los detalles de los problemas encontrados.
      if (!resultado.success) {
        return responderError(res, 400, {
          description: `Datos inválidos en ${parte}`,
          codigo: "DATOS_INVALIDOS",
          detalles: resultado.error.issues.map((issue) => ({
            campo: issue.path.join("."),
            mensaje: issue.message,
          })),
        });
      }

      // Si la validación es exitosa, guarda los datos validados: el body reemplaza al original
      // y el query va a res.locals, porque en Express 5 req.query es de solo lectura.
      if (parte === "body") req.body = resultado.data;
      if (parte === "query") res.locals.query = resultado.data;
    }

    next();
  };
}
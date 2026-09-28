import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";

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
        return res.status(400).json({
          error: "Datos inválidos",
          ubicacion: parte,
          detalles: resultado.error.issues.map((issue) => ({
            campo: issue.path.join("."),
            mensaje: issue.message,
          })),
        });
      }

      // Si la validación es exitosa, reemplaza los datos de la parte correspondiente de la solicitud con los datos validados.
      if (parte === "body") req.body = resultado.data;
      if (parte === "query") res.locals.query = resultado.data;
    }
    
    next();
  };
}
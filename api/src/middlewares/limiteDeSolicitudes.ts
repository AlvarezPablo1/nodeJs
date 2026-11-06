import { rateLimit } from "express-rate-limit";
import { responderError } from "../shared/respuesta.js";

function crearLimite(opciones: { ventanaMinutos: number; maximo: number; mensaje: string }) {
  return rateLimit({
    windowMs: opciones.ventanaMinutos * 60 * 1000,
    limit: opciones.maximo,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => {
      responderError(res, 429, {
        description: opciones.mensaje,
        codigo: "DEMASIADAS_SOLICITUDES",
      });
    },
  });
}

export const limiteGeneral = crearLimite({
  ventanaMinutos: 15,
  maximo: 300,
  mensaje: "Hiciste demasiadas solicitudes. Probá de nuevo en unos minutos.",
});

export const limiteAutenticacion = crearLimite({
  ventanaMinutos: 15,
  maximo: 10,
  mensaje: "Demasiados intentos. Probá de nuevo en 15 minutos.",
});
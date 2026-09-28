import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/appError.js";

// Este middleware se encarga de manejar los errores que ocurren en la aplicación.
export const manejadorDeErrores: ErrorRequestHandler = (err, req, res, next) => {
    // Si el error es una instancia de AppError, se devuelve el código de estado y el mensaje del error.
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message });
    }

    // Si el error es un error de análisis de JSON, se devuelve un código de estado 400 y un mensaje de error.
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "El body no es un JSON válido" });
    }

    // Si el error no es un AppError ni un error de análisis de JSON, se devuelve un código de estado 500 y un mensaje de error genérico.
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
};
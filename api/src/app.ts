import express from "express";
import { logger } from "./middlewares/logger.js";
import { profesionalesRouter } from "./modules/profesionales/profesionales.routes.js";
import { rutaNoEncontrada } from "./middlewares/rutaNoEncontrada.js";
import { manejadorDeErrores } from "./middlewares/manejadorDeErrores.js";

// Configuración de la aplicación, incluyendo middlewares y rutas.

export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(logger);

app.use("/api/v1/profesionales", profesionalesRouter);

app.use(rutaNoEncontrada);
app.use(manejadorDeErrores);
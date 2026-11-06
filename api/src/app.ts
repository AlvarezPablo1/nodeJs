import express from "express";
import { logger } from "./middlewares/logger.js";
import { profesionalesRouter } from "./modules/profesionales/profesionales.routes.js";
import { rutaNoEncontrada } from "./middlewares/rutaNoEncontrada.js";
import { manejadorDeErrores } from "./middlewares/manejadorDeErrores.js";
import { turnosRouter } from "./modules/turnos/turnos.routes.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/auth.routes.js";
import helmet from "helmet";
import { env } from "./config/env.js";
import cors from "cors";
import { limiteGeneral } from "./middlewares/limiteDeSolicitudes.js";

// Configuración de la aplicación, incluyendo middlewares y rutas.

export const app = express();

// Configuración de Helmet para mejorar la seguridad de la aplicación mediante el establecimiento de cabeceras HTTP adecuadas.
app.use(helmet());
// Configuración de CORS para permitir solicitudes desde los orígenes especificados en las variables de entorno.
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  }),
);
// Limita la cantidad de solicitudes que un cliente puede hacer en un período de tiempo determinado para proteger la aplicación contra ataques de denegación de servicio (DoS) y abuso de recursos.
app.use(limiteGeneral);
//Limita el tamaño de las solicitudes a 100kb para evitar ataques de denegación de servicio (DoS) 
//y proteger la aplicación de solicitudes excesivamente grandes que podrían afectar el rendimiento o la seguridad.
app.use(express.json({ limit: "100kb" }));
// Configuración de cookie-parser para analizar las cookies en las solicitudes entrantes.
app.use(cookieParser());
// Configuración de un middleware de registro para registrar información sobre las solicitudes entrantes y las respuestas salientes, lo que facilita la depuración y el monitoreo de la aplicación.
app.use(logger);

app.use("/api/v1/profesionales", profesionalesRouter);
app.use("/api/v1/turnos", turnosRouter);
app.use("/api/v1/auth", authRouter);
    
app.use(rutaNoEncontrada);
app.use(manejadorDeErrores);
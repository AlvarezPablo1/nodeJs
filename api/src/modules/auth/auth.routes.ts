import { Router } from "express";
import { autenticar } from "../../middlewares/autenticar.js";
import { validar } from "../../middlewares/validar.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registroSchema } from "./auth.schema.js";
import { limiteAutenticacion } from "../../middlewares/limiteDeSolicitudes.js";

export const authRouter = Router();

authRouter.post("/registro", limiteAutenticacion, validar({ body: registroSchema }), authController.registrar);
authRouter.post("/login", limiteAutenticacion, validar({ body: loginSchema }), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/yo", autenticar, authController.yo);
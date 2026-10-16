import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import { idParamsSchema } from "../../shared/schemas.js";
import { turnosController } from "./turnos.controller.js";
import { listarTurnosQuerySchema } from "./turnos.schema.js";

export const turnosRouter = Router();

turnosRouter.get("/", validar({ query: listarTurnosQuerySchema }), turnosController.listar);
turnosRouter.get("/:id", validar({ params: idParamsSchema }), turnosController.obtener);
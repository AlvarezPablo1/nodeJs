import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import { idParamsSchema } from "../../shared/schemas.js";
import { turnosController } from "./turnos.controller.js";
import { listarTurnosQuerySchema, reprogramarTurnoSchema, reservarTurnoSchema } from "./turnos.schema.js";

export const turnosRouter = Router();

turnosRouter.get("/", validar({ query: listarTurnosQuerySchema }), turnosController.listar);
turnosRouter.get("/:id", validar({ params: idParamsSchema }), turnosController.obtener);
turnosRouter.post("/", validar({ body: reservarTurnoSchema }), turnosController.reservar);
turnosRouter.post("/:id/reprogramar", validar({ params: idParamsSchema, body: reprogramarTurnoSchema }), turnosController.reprogramar);
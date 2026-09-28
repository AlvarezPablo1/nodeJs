import { Router } from "express";
import { validar } from "../../middlewares/validar.js";
import { idParamsSchema } from "../../shared/schemas.js";
import { profesionalSchema, listarProfesionalesQuerySchema } from "./profesionales.schema.js";
import { profesionalesController } from "./profesionales.controller.js";

export const profesionalesRouter = Router();

// Definición de rutas para el módulo de profesionales
profesionalesRouter.get("/", validar({ query: listarProfesionalesQuerySchema }), profesionalesController.listar);
profesionalesRouter.get("/:id", validar({ params: idParamsSchema }), profesionalesController.obtener);
profesionalesRouter.post("/", validar({ body: profesionalSchema }), profesionalesController.crear);
profesionalesRouter.put("/:id", validar({ params: idParamsSchema, body: profesionalSchema }), profesionalesController.actualizar);
profesionalesRouter.delete("/:id", validar({ params: idParamsSchema }), profesionalesController.eliminar);
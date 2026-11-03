import { Router } from "express";
import { idParamsSchema } from "../../shared/schemas.js";
import { profesionalSchema, listarProfesionalesQuerySchema, disponibilidadQuerySchema } from "./profesionales.schema.js";
import { profesionalesController } from "./profesionales.controller.js";
import { validar } from "../../middlewares/validar.js";
import { autorizar } from "../../middlewares/autorizar.js";
import { autenticar } from "../../middlewares/autenticar.js";

export const profesionalesRouter = Router();

// Definición de rutas para el módulo de profesionales
profesionalesRouter.get("/", validar({ query: listarProfesionalesQuerySchema }), profesionalesController.listar);
profesionalesRouter.get("/:id", validar({ params: idParamsSchema }), profesionalesController.obtener);
profesionalesRouter.get("/:id/disponibilidad", validar({ params: idParamsSchema, query: disponibilidadQuerySchema }), profesionalesController.disponibilidad);
profesionalesRouter.get(
  "/:id/estadisticas",
  autenticar,
  autorizar("admin", "profesional"),
  validar({ params: idParamsSchema }),
  profesionalesController.estadisticas,
);
profesionalesRouter.post("/", autenticar, autorizar("admin"), validar({ body: profesionalSchema }), profesionalesController.crear);
profesionalesRouter.put(
  "/:id",
  autenticar,
  autorizar("admin"),
  validar({ params: idParamsSchema, body: profesionalSchema }),
  profesionalesController.actualizar,
);
profesionalesRouter.delete("/:id", autenticar, autorizar("admin"), validar({ params: idParamsSchema }), profesionalesController.eliminar);
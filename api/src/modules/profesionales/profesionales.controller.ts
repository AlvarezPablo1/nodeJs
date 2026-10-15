import type { Request, Response } from "express";
import { profesionalesService } from "./profesionales.service.js";
import type { ListarProfesionalesQuery } from "./profesionales.schema.js";
import type { IdParams } from "../../shared/schemas.js";


// Controlador que maneja las solicitudes HTTP relacionadas con los profesionales.
export const profesionalesController = {
  async listar(req: Request, res: Response) {
    const { especialidad } = res.locals.query as ListarProfesionalesQuery;
    res.json(await profesionalesService.listar({ especialidad }));
  },

  async obtener(req: Request<IdParams>, res: Response) {
    res.json(await profesionalesService.obtener(req.params.id));
  },

  async crear(req: Request, res: Response) {
    res.status(201).json(await profesionalesService.crear(req.body));
  },

  async actualizar(req: Request<IdParams>, res: Response) {
    res.json(await profesionalesService.actualizar(req.params.id, req.body));
  },

  async eliminar(req: Request<IdParams>, res: Response) {
    await profesionalesService.eliminar(req.params.id);
    res.status(204).send();
  },
};
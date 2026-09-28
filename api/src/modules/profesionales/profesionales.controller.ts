import type { Request, Response } from "express";
import { profesionalesService } from "./profesionales.service.js";
import type { ListarProfesionalesQuery } from "./profesionales.schema.js";
import type { IdParams } from "../../shared/schemas.js";


// Controlador que maneja las solicitudes HTTP relacionadas con los profesionales.
export const profesionalesController = {
  listar(req: Request, res: Response) {
    const { especialidad } = res.locals.query as ListarProfesionalesQuery;
    res.json(profesionalesService.listar({ especialidad }));
  },

  obtener(req: Request<IdParams>, res: Response) {
    res.json(profesionalesService.obtener(req.params.id));
  },

  crear(req: Request, res: Response) {
    res.status(201).json(profesionalesService.crear(req.body));
  },

  actualizar(req: Request<IdParams>, res: Response) {
    res.json(profesionalesService.actualizar(req.params.id, req.body));
  },

  eliminar(req: Request<IdParams>, res: Response) {
    profesionalesService.eliminar(req.params.id);
    res.status(204).send();
  },
};
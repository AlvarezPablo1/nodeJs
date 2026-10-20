import type { Request, Response } from "express";
import { responderOk } from "../../shared/respuesta.js";
import type { IdParams } from "../../shared/schemas.js";
import type { ListarTurnosQuery } from "./turnos.schema.js";
import { turnosService } from "./turnos.service.js";

export const turnosController = {
  async listar(req: Request, res: Response) {
    const { turnos, paginacion } = await turnosService.listar(res.locals.query as ListarTurnosQuery);
    responderOk(res, turnos, { meta: paginacion });
  },

  async obtener(req: Request<IdParams>, res: Response) {
    responderOk(res, await turnosService.obtener(req.params.id));
  },

  async reservar(req: Request, res: Response) {
    responderOk(res, await turnosService.reservar(req.body), { status: 201 });
  },

  async reprogramar(req: Request<IdParams>, res: Response) {
    const { inicio, duracion } = req.body;
    responderOk(res, await turnosService.reprogramar(req.params.id, inicio, duracion), { status: 201 });
  },
};
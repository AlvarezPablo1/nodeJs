import type { Request, Response } from "express";
import { responderNegativo, responderOk } from "../../shared/respuesta.js";
import type { IdParams } from "../../shared/schemas.js";
import { profesionalesService } from "./profesionales.service.js";
import type { DisponibilidadQuery, ListarProfesionalesQuery } from "./profesionales.schema.js";
import { turnosService } from "../turnos/turnos.service.js";

export const profesionalesController = {
  async listar(req: Request, res: Response) {
    const { especialidad } = res.locals.query as ListarProfesionalesQuery;
    responderOk(res, await profesionalesService.listar({ especialidad }));
  },

  async obtener(req: Request<IdParams>, res: Response) {
    responderOk(res, await profesionalesService.obtener(req.params.id));
  },

  async crear(req: Request, res: Response) {
    responderOk(res, await profesionalesService.crear(req.body), { status: 201 });
  },

  async actualizar(req: Request<IdParams>, res: Response) {
    responderOk(res, await profesionalesService.actualizar(req.params.id, req.body));
  },

  async eliminar(req: Request<IdParams>, res: Response) {
    await profesionalesService.eliminar(req.params.id);
    responderOk(res, null);
  },

  async disponibilidad(req: Request<IdParams>, res: Response) {
  const { fecha, duracion } = res.locals.query as DisponibilidadQuery;
  const { libres, atiende } = await turnosService.calcularDisponibilidad(req.params.id, fecha, duracion);

  if (!atiende) {
    return responderNegativo(res, "El profesional no atiende ese día", { atiende: false, horarios: [] }, {
      meta: { fecha, duracion },
    });
  }

  responderOk(res, { atiende: true, horarios: libres }, {
    meta: { fecha, duracion, cantidad: libres.length },
  });
},

  async estadisticas(req: Request<IdParams>, res: Response) {
    responderOk(res, await turnosService.estadisticasDeProfesional(req.params.id));
  },

};
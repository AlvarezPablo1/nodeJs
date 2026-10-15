
import { NotFoundError } from "../../errors/appError.js";
import { profesionalesRepository } from "./profesionales.repository.js";
import type { ProfesionalInput } from "./profesionales.schema.js";

export const profesionalesService = {
  listar(filtro: { especialidad?: string }) {
    return profesionalesRepository.listar(filtro);
  },

  async obtener(id: string) {
    const profesional = await profesionalesRepository.buscarPorId(id);
    if (!profesional) throw new NotFoundError("Profesional");
    return profesional;
  },

  crear(datos: ProfesionalInput) {
    return profesionalesRepository.crear(datos);
  },

  async actualizar(id: string, datos: ProfesionalInput) {
    const actualizado = await profesionalesRepository.actualizar(id, datos);
    if (!actualizado) throw new NotFoundError("Profesional");
    return actualizado;
  },

  async eliminar(id: string) {
    const eliminado = await profesionalesRepository.eliminar(id);
    if (!eliminado) throw new NotFoundError("Profesional");
  },
};
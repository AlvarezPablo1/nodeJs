
import { NotFoundError } from "../../errors/appError.js";
import { profesionalesRepository } from "./profesionales.repository.js";
import type { ProfesionalInput } from "./profesionales.schema.js";

export const profesionalesService = {

  listar(filtro: { especialidad?: string }) {
    return profesionalesRepository.listar(filtro);
  },

  obtener(id: string) {
    const profesional = profesionalesRepository.buscarPorId(id);
    if (!profesional) throw new NotFoundError("Profesional");
    return profesional;
  },

  crear(datos: ProfesionalInput) {
    return profesionalesRepository.crear(datos);
  },

  actualizar(id: string, datos: ProfesionalInput) {
    const actualizado = profesionalesRepository.actualizar(id, datos);
    if (!actualizado) throw new NotFoundError("Profesional");
    return actualizado;
  },

  eliminar(id: string) {
    const eliminado = profesionalesRepository.eliminar(id);
    if (!eliminado) throw new NotFoundError("Profesional");
  },
};
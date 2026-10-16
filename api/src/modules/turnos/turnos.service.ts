import { NotFoundError } from "../../errors/appError.js";
import { horariosRepository } from "../horarios/horarios.repository.js";
import { profesionalesService } from "../profesionales/profesionales.service.js";
import { turnosRepository } from "./turnos.repository.js";
import type { ListarTurnosQuery } from "./turnos.schema.js";

function minutosDelDia(hora: Date) {
  return hora.getUTCHours() * 60 + hora.getUTCMinutes();
}

export const turnosService = {
  async listar(query: ListarTurnosQuery) {
    const { pagina, porPagina, ...filtros } = query;
    const [turnos, total] = await turnosRepository.listar(filtros, pagina, porPagina);

    return {
      turnos,
      paginacion: { pagina, porPagina, total, totalPaginas: Math.ceil(total / porPagina) },
    };
  },

  async obtener(id: string) {
    const turno = await turnosRepository.buscarPorId(id);
    if (!turno) throw new NotFoundError("Turno");
    return turno;
  },

  async calcularDisponibilidad(profesionalId: string, fecha: string, duracion: number) {
    await profesionalesService.obtener(profesionalId);

    const [anio, mes, dia] = fecha.split("-").map(Number);
    const inicioDelDia = new Date(anio, mes - 1, dia);
    const finDelDia = new Date(anio, mes - 1, dia + 1);

    const [horarios, ocupados] = await Promise.all([
      horariosRepository.listarPorDia(profesionalId, inicioDelDia.getDay()),
      turnosRepository.listarOcupados(profesionalId, inicioDelDia, finDelDia),
    ]);

    const ahora = new Date();
    const libres: { inicio: Date; fin: Date }[] = [];

    for (const horario of horarios) {
      const desde = minutosDelDia(horario.inicio);
      const hasta = minutosDelDia(horario.fin);

      for (let minuto = desde; minuto + duracion <= hasta; minuto += duracion) {
        const inicio = new Date(anio, mes - 1, dia, 0, minuto);
        const fin = new Date(inicio.getTime() + duracion * 60_000);

        const pisaOtroTurno = ocupados.some((t) => t.inicio < fin && inicio < t.fin);

        if (!pisaOtroTurno && inicio > ahora) {
          libres.push({ inicio, fin });
        }
      }
    }

    return { libres, atiende: horarios.length > 0 };
  },
};
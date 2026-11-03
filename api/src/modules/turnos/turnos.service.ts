import { AppError, ForbiddenError, NotFoundError, ReglaDeNegocioError } from "../../errors/appError.js";
import { UsuarioAutenticado } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { clientesRepository } from "../clientes/clientes.repository.js";
import { horariosRepository } from "../horarios/horarios.repository.js";
import { profesionalesService } from "../profesionales/profesionales.service.js";
import { turnosRepository } from "./turnos.repository.js";
import type { ListarTurnosQuery, ReservarTurnoInput } from "./turnos.schema.js";

type Alcance = { clienteId?: string; profesionalId?: string };

  
function minutosDelDia(hora: Date) {
  return hora.getUTCHours() * 60 + hora.getUTCMinutes();
}

function resolverClienteId(usuario: UsuarioAutenticado, datos: ReservarTurnoInput): string {
  if (usuario.rol === "cliente") {
    if (!usuario.clienteId) {
      throw new ForbiddenError("Tu cuenta no está vinculada a un cliente");
    }
    if (datos.clienteId && datos.clienteId !== usuario.clienteId) {
      throw new ForbiddenError("No podés reservar turnos a nombre de otra persona");
    }
    return usuario.clienteId;
  }

  if (usuario.rol === "profesional" && datos.profesionalId !== usuario.profesionalId) {
    throw new ForbiddenError("Solo podés reservar turnos en tu propia agenda");
  }

  if (!datos.clienteId) {
    throw new AppError(400, "DATOS_INVALIDOS", "Tenés que indicar el clienteId");
  }

  return datos.clienteId;
}

async function verificarReglasDeHorario(profesionalId: string, inicio: Date, fin: Date) {
  if (inicio <= new Date()) {
    throw new ReglaDeNegocioError("TURNO_EN_EL_PASADO", "No se puede reservar un turno en el pasado");
  }

  const horarios = await horariosRepository.listarPorDia(profesionalId, inicio.getDay());
  const minutoInicio = inicio.getHours() * 60 + inicio.getMinutes();
  const minutoFin = minutoInicio + (fin.getTime() - inicio.getTime()) / 60_000;

  const dentroDeUnaFranja = horarios.some(
    (h) => minutosDelDia(h.inicio) <= minutoInicio && minutoFin <= minutosDelDia(h.fin),
  );

  if (!dentroDeUnaFranja) {
    throw new ReglaDeNegocioError("FUERA_DE_HORARIO", "El horario está fuera de la atención del profesional");
  }
}

function alcanceDe(usuario: UsuarioAutenticado): Alcance {
  if (usuario.rol === "admin") return {};
  if (usuario.rol === "profesional" && usuario.profesionalId) return { profesionalId: usuario.profesionalId };
  if (usuario.rol === "cliente" && usuario.clienteId) return { clienteId: usuario.clienteId };

  throw new ForbiddenError("Tu cuenta no está vinculada a un profesional ni a un cliente");
}

function puedeAcceder(usuario: UsuarioAutenticado, turno: { profesionalId: string; clienteId: string }) {
  const alcance = alcanceDe(usuario);

  return (
    (!alcance.profesionalId || turno.profesionalId === alcance.profesionalId) &&
    (!alcance.clienteId || turno.clienteId === alcance.clienteId)
  );
}

export const turnosService = {

  async reprogramar(id: string, usuario: UsuarioAutenticado, nuevoInicio: Date, duracion?: number) {
  const actual = await turnosService.obtenerPara(id, usuario);


    if (actual.estado !== "confirmado") {
      throw new ReglaDeNegocioError("TURNO_NO_REPROGRAMABLE", "Solo se pueden reprogramar turnos confirmados");
    }

    const minutos = duracion ?? (actual.fin.getTime() - actual.inicio.getTime()) / 60_000;
    const fin = new Date(nuevoInicio.getTime() + minutos * 60_000);

    await verificarReglasDeHorario(actual.profesionalId, nuevoInicio, fin);

    return prisma.$transaction(async (tx) => {
      await turnosRepository.cambiarEstado(id, "cancelado", tx);

      const nuevo = await turnosRepository.crear(
        { profesionalId: actual.profesionalId, clienteId: actual.clienteId, inicio: nuevoInicio, fin },
        tx,
      );

      if (!nuevo) {
        throw new ReglaDeNegocioError("HORARIO_OCUPADO", "El nuevo horario ya está ocupado");
      }

      return nuevo;
    });
  },

  async reservar(datos: ReservarTurnoInput, usuario: UsuarioAutenticado) {
    const clienteId = resolverClienteId(usuario, datos);
    const { profesionalId, inicio, duracion } = datos;
    const fin = new Date(inicio.getTime() + duracion * 60_000);

    await profesionalesService.obtener(profesionalId);

    const cliente = await clientesRepository.buscarPorId(clienteId);
    if (!cliente) throw new NotFoundError("Cliente");
    
    await verificarReglasDeHorario(profesionalId, inicio, fin);

    const ocupados = await turnosRepository.listarOcupados(profesionalId, inicio, fin);
    if (ocupados.length > 0) {
      throw new ReglaDeNegocioError("HORARIO_OCUPADO", "El horario ya está ocupado");
    }
    const turno = await turnosRepository.crear({ profesionalId, clienteId, inicio, fin });
    if (!turno) {
      throw new ReglaDeNegocioError("HORARIO_OCUPADO", "El horario ya está ocupado");
    }

    return turno;
  },
  
  async listar(query: ListarTurnosQuery, usuario: UsuarioAutenticado) {
  const { pagina, porPagina, ...filtros } = query;
  const [turnos, total] = await turnosRepository.listar({ ...filtros, ...alcanceDe(usuario) }, pagina, porPagina);

  return {
    turnos,
    paginacion: { pagina, porPagina, total, totalPaginas: Math.ceil(total / porPagina) },
  };
},

  async obtenerPara(id: string, usuario: UsuarioAutenticado) {
    const turno = await turnosService.obtener(id);

    if (!puedeAcceder(usuario, turno)) {
      throw new NotFoundError("Turno");
    }

    return turno;
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

 async estadisticasDeProfesional(profesionalId: string, usuario: UsuarioAutenticado) {
  if (usuario.rol === "profesional" && usuario.profesionalId !== profesionalId) {
    throw new ForbiddenError("Solo podés ver tus propias estadísticas");
  }

  await profesionalesService.obtener(profesionalId);
  // ...el resto queda igual

    const grupos = await turnosRepository.contarPorEstado(profesionalId);

    const porEstado: Record<"confirmado" | "cancelado" | "completado", number> = {
      confirmado: 0,
      cancelado: 0,
      completado: 0,
    };

    for (const grupo of grupos) {
      porEstado[grupo.estado] = grupo._count._all;
    }

    const total = porEstado.confirmado + porEstado.cancelado + porEstado.completado;

    return { total, porEstado };
  },
};
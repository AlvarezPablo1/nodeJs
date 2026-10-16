import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { ListarTurnosQuery } from "./turnos.schema.js";

type FiltrosTurnos = Omit<ListarTurnosQuery, "pagina" | "porPagina">;

const incluirResumen = {
  profesional: { select: { id: true, nombre: true, especialidad: true } },
  cliente: { select: { id: true, nombre: true } },
} satisfies Prisma.TurnoInclude;

export const turnosRepository = {
  listar(filtros: FiltrosTurnos, pagina: number, porPagina: number) {
    const where: Prisma.TurnoWhereInput = {
      profesionalId: filtros.profesionalId,
      clienteId: filtros.clienteId,
      estado: filtros.estado,
      inicio: { gte: filtros.desde, lt: filtros.hasta },
    };

    return prisma.$transaction([
      prisma.turno.findMany({
        where,
        include: incluirResumen,
        orderBy: { inicio: filtros.orden === "-inicio" ? "desc" : "asc" },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.turno.count({ where }),
    ]);
  },

  buscarPorId(id: string) {
    return prisma.turno.findUnique({ where: { id }, include: incluirResumen });
  },

  listarOcupados(profesionalId: string, desde: Date, hasta: Date) {
    return prisma.turno.findMany({
      where: {
        profesionalId,
        estado: { not: "cancelado" },
        inicio: { lt: hasta },
        fin: { gt: desde },
      },
      select: { inicio: true, fin: true },
    });
  },

  contarPorEstado(profesionalId: string) {
  return prisma.turno.groupBy({
    by: ["estado"],
    where: { profesionalId },
    _count: { _all: true },
  });
},
};
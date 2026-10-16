import { prisma } from "../../lib/prisma.js";

export const horariosRepository = {
  listarPorDia(profesionalId: string, diaSemana: number) {
    return prisma.horarioDisponible.findMany({
      where: { profesionalId, diaSemana },
      orderBy: { inicio: "asc" },
    });
  },
};
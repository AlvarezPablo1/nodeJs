import { prisma } from "../../lib/prisma.js";

export const clientesRepository = {
  buscarPorId(id: string) {
    return prisma.cliente.findUnique({ where: { id } });
  },
};
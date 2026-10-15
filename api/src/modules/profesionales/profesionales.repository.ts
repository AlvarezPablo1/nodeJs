import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import type { ProfesionalInput } from "./profesionales.schema.js";

function esNoEncontrado(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export const profesionalesRepository = {
  listar(filtro: { especialidad?: string } = {}) {
    return prisma.profesional.findMany({
      where: { especialidad: filtro.especialidad },
      orderBy: { nombre: "asc" },
    });
  },

  buscarPorId(id: string) {
    return prisma.profesional.findUnique({ where: { id } });
  },

  crear(datos: ProfesionalInput) {
    return prisma.profesional.create({ data: datos });
  },

  async actualizar(id: string, datos: ProfesionalInput) {
    try {
      return await prisma.profesional.update({ where: { id }, data: datos });
    } catch (error) {
      if (esNoEncontrado(error)) return null;
      throw error;
    }
  },

  async eliminar(id: string) {
    try {
      await prisma.profesional.delete({ where: { id } });
      return true;
    } catch (error) {
      if (esNoEncontrado(error)) return false;
      throw error;
    }
  },
};
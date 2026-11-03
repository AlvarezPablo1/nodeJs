import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

const usuarioPublico = {
  id: true,
  email: true,
  rol: true,
  profesional: { select: { id: true, nombre: true } },
  cliente: { select: { id: true, nombre: true } },
} satisfies Prisma.UsuarioSelect;

export const authRepository = {

  buscarClientePorEmail(email: string) {
  return prisma.cliente.findUnique({
    where: { email },
    select: { id: true, usuarioId: true },
  });
},

  async crearUsuarioVinculado(datos: { email: string; passwordHash: string; clienteId: string }) {
    try {
      return await prisma.usuario.create({
        data: {
          email: datos.email,
          passwordHash: datos.passwordHash,
          rol: "cliente",
          cliente: {
            connect: { id: datos.clienteId },
          },
        },
        select: usuarioPublico,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return null;
      throw error;
    }
  },

  buscarPorEmailConPassword(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      include: { profesional: { select: { id: true } }, cliente: { select: { id: true } } },
    });
  },

  buscarPorId(id: string) {
    return prisma.usuario.findUnique({ where: { id }, select: usuarioPublico });
  },

  async crearCliente(datos: { email: string; passwordHash: string; nombre: string; telefono?: string }) {
    try {
      return await prisma.usuario.create({
        data: {
          email: datos.email,
          passwordHash: datos.passwordHash,
          rol: "cliente",
          cliente: {
            create: { nombre: datos.nombre, email: datos.email, telefono: datos.telefono },
          },
        },
        select: usuarioPublico,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return null;
      throw error;
    }
  },
};
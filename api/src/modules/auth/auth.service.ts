import { ReglaDeNegocioError, UnauthorizedError } from "../../errors/appError.js";
import { firmarToken } from "../../lib/jwt.js";
import { hashearPassword, verificarPassword } from "../../lib/password.js";
import { authRepository } from "./auth.repository.js";
import type { LoginInput, RegistroInput } from "./auth.schema.js";

export const authService = {
  async registrar(datos: RegistroInput) {
  const clienteExistente = await authRepository.buscarClientePorEmail(datos.email);
  
  // Camino 1: el cliente ya tiene cuenta
  if (clienteExistente?.usuarioId) {
    throw new ReglaDeNegocioError("EMAIL_EN_USO", "Ya existe una cuenta con ese email");
  }

  const passwordHash = await hashearPassword(datos.password);

  // Camino 2: el cliente existe pero sin cuenta → se vincula
  // TODO: verificar que la persona es dueña del email antes de vincular (lección 16)
  // Camino 3: no existe ningún cliente → se crea uno nuevo junto con el usuario
  const usuario = clienteExistente
    ? await authRepository.crearUsuarioVinculado({
        email: datos.email,
        passwordHash,
        clienteId: clienteExistente.id,
      })
    : await authRepository.crearCliente({
        email: datos.email,
        passwordHash,
        nombre: datos.nombre,
        telefono: datos.telefono,
      });

  if (!usuario) {
    throw new ReglaDeNegocioError("EMAIL_EN_USO", "Ya existe una cuenta con ese email");
  }

  return usuario;
},

  async login(datos: LoginInput) {
    // Hash de una contraseña que no pertenece a nadie. Se usa para que el login
    // tarde lo mismo exista o no el usuario, y no revele qué emails tienen cuenta.
    const hashFalso = hashearPassword("contraseña-que-no-pertenece-a-nadie");
    const usuario = await authRepository.buscarPorEmailConPassword(datos.email);
    const hashAComparar = usuario?.passwordHash ?? (await hashFalso);
    const passwordValida = await verificarPassword(hashAComparar, datos.password);

    if (!usuario || !passwordValida) {
      throw new ReglaDeNegocioError("CREDENCIALES_INVALIDAS", "Email o contraseña incorrectos");
    }

    const token = firmarToken({
      sub: usuario.id,
      rol: usuario.rol,
      profesionalId: usuario.profesional?.id ?? null,
      clienteId: usuario.cliente?.id ?? null,
    });

    return { token, usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol } };
  },

  async obtenerActual(usuarioId: string) {
    const usuario = await authRepository.buscarPorId(usuarioId);
    if (!usuario) throw new UnauthorizedError("La cuenta ya no existe");
    return usuario;
  },
};
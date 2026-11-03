export class AppError extends Error {
  readonly status: number;
  readonly codigo: string;

  constructor(status: number, codigo: string, message: string) {
    super(message);
    this.status = status;
    this.codigo = codigo;
    this.name = "AppError";
  }
}
export class ReglaDeNegocioError extends Error {
  readonly codigo: string;

  constructor(codigo: string, message: string) {
    super(message);
    this.codigo = codigo;
    this.name = "ReglaDeNegocioError";
  }
}

export class NotFoundError extends AppError {
  constructor(recurso: string) {
    super(404, "NO_ENCONTRADO", `${recurso} no encontrado`);
  }
}

export class ConflictError extends AppError {
  constructor(mensaje: string) {
    super(409, "CONFLICTO", mensaje);
  }
}

export class UnauthorizedError extends AppError {
  constructor(mensaje = "Tenés que iniciar sesión") {
    super(401, "NO_AUTENTICADO", mensaje);
  }
}

export class ForbiddenError extends AppError {
  constructor(mensaje = "No tenés permiso para realizar esta acción") {
    super(403, "SIN_PERMISO", mensaje);
  }
}
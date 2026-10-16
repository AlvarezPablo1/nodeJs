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
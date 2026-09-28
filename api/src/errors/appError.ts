// Error personalizado para errores de la aplicación
export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}
// Error personalizado para errores de recurso no encontrado
export class NotFoundError extends AppError {
    // Constructor que recibe el nombre del recurso no encontrado
    constructor(recurso: string) {
        // Llama al constructor de la clase base AppError con el código de estado 404 y un mensaje personalizado
        super(404, `${recurso} no encontrado`);
    }
}
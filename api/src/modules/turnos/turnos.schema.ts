import { z } from "zod";

const fechaHoraSchema = z
  .iso.datetime({
    offset: true,
    error: "La fecha tiene que tener formato ISO con zona horaria, por ejemplo 2026-10-20T10:00:00-03:00",
  })
  .transform((valor) => new Date(valor));

const duracionSchema = z
  .number()
  .int()
  .min(15)
  .max(240)
  .multipleOf(15, "La duración tiene que ser múltiplo de 15 minutos");
  
export const listarTurnosQuerySchema = z.object({
    profesionalId: z.uuid().optional(),
    clienteId: z.uuid().optional(),
    estado: z.enum(["confirmado", "cancelado", "completado"]).optional(),
    // coerce convierte los strings de la query en fechas y números
    desde: z.coerce.date().optional(),
    hasta: z.coerce.date().optional(),
    pagina: z.coerce.number().int().min(1).default(1),
    porPagina: z.coerce.number().int().min(1).max(50).default(10),
    orden: z.enum(['inicio', '-inicio']).default('inicio'),
  })
  .refine((q) => !q.desde || !q.hasta || q.desde < q.hasta, {
    error: "'desde' tiene que ser anterior a 'hasta'",
    path: ["desde"],
  });

export const reservarTurnoSchema = z.object({
  profesionalId: z.uuid("El profesionalId tiene que ser un UUID válido"),
  clienteId: z.uuid("El clienteId tiene que ser un UUID válido"),
  inicio: fechaHoraSchema,
  duracion: duracionSchema.default(30),
});

export const reprogramarTurnoSchema = z.object({
  inicio: fechaHoraSchema,
  duracion: duracionSchema.optional(),
});

export type ReservarTurnoInput = z.infer<typeof reservarTurnoSchema>;
export type ReprogramarTurnoInput = z.infer<typeof reprogramarTurnoSchema>;
export type ListarTurnosQuery = z.infer<typeof listarTurnosQuerySchema>;
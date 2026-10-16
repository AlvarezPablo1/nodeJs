import { z } from "zod";

export const listarTurnosQuerySchema = z.object({
    profesionalId: z.uuid().optional(),
    clienteId: z.uuid().optional(),
    estado: z.enum(["confirmado", "cancelado", "completado"]).optional(),
    // coerce convierte los strings de la query en fechas y números
    desde: z.coerce.date().optional(),
    hasta: z.coerce.date().optional(),
    pagina: z.coerce.number().int().min(1).default(1),
    porPagina: z.coerce.number().int().min(1).max(50).default(10),
  })
  .refine((q) => !q.desde || !q.hasta || q.desde < q.hasta, {
    error: "'desde' tiene que ser anterior a 'hasta'",
    path: ["desde"],
  });

export type ListarTurnosQuery = z.infer<typeof listarTurnosQuerySchema>;
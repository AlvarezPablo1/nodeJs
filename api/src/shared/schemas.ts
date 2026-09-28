import { z } from "zod";

//Esquema global para validar el parámetro de ruta que contiene un ID, asegurando que sea un UUID válido.
export const idParamsSchema = z.object({
  id: z.uuid("El ID debe ser un UUID válido"),
});

export type IdParams = z.infer<typeof idParamsSchema>;
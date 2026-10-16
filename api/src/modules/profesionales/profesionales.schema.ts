import { z } from "zod";

// Esquema para validar los parámetros de la ruta que contienen un ID.
export const profesionalSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  especialidad: z.string().trim().min(2, "La especialidad es obligatoria"),
  email: z.email("El email no es válido"),
});

// Esquema para validar los parámetros de la ruta que contienen un ID.
export const listarProfesionalesQuerySchema = z.object({
  especialidad: z.string().trim().min(1).optional(),
});

//esquema para validar la disponibilidad del profesional
export const disponibilidadQuerySchema = z.object({
  fecha: z.iso.date("La fecha tiene que tener formato AAAA-MM-DD"),
  duracion: z.coerce.number().int().min(15).max(240).default(30),
});

export type DisponibilidadQuery = z.infer<typeof disponibilidadQuerySchema>;

// Tipos derivados de los esquemas
export type ProfesionalInput = z.infer<typeof profesionalSchema>;
export type ListarProfesionalesQuery = z.infer<typeof listarProfesionalesQuerySchema>;
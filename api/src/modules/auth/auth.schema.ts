import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("El email no es válido"));

export const registroSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: emailSchema,
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128),
  telefono: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
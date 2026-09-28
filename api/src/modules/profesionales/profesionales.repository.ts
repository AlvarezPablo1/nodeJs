import { randomUUID } from "node:crypto";
import { Profesional, ProfesionalInput } from "./profesionales.schema.js";

// Array que simula una base de datos en memoria para almacenar profesionales.
const profesionales: Profesional[] = [
  { id: "11111111-1111-4111-8111-111111111111", nombre: "Laura Gómez", especialidad: "Kinesiología", email: "laura@turnero.com" },
  { id: "22222222-2222-4222-8222-222222222222", nombre: "Martín Ruiz", especialidad: "Nutrición", email: "martin@turnero.com" },
];

export const profesionalesRepository = {
  // Función para listar profesionales, con un filtro opcional por especialidad.
  listar(filtro: { especialidad?: string } = {}) {
    if (!filtro.especialidad) return profesionales;
    return profesionales.filter((p) => p.especialidad === filtro.especialidad);
  },

  // Función para buscar un profesional por su ID.
  buscarPorId(id: string) {
    return profesionales.find((p) => p.id === id);
  },

  // Función para crear un nuevo profesional a partir de los datos proporcionados.
  crear(datos: ProfesionalInput) {
    const nuevo: Profesional = { id: randomUUID(), ...datos };
    profesionales.push(nuevo);
    return nuevo;
  },

  // Función para actualizar los datos de un profesional existente por su ID.
  actualizar(id: string, datos: ProfesionalInput) {
    const indice = profesionales.findIndex((p) => p.id === id);
    if (indice === -1) return undefined;

    profesionales[indice] = { id, ...datos };
    return profesionales[indice];
  },

  // Función para eliminar un profesional por su ID.
  eliminar(id: string) {
    const indice = profesionales.findIndex((p) => p.id === id);
    if (indice === -1) return false;

    profesionales.splice(indice, 1);
    return true;
  },
};
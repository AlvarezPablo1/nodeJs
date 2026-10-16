import { prisma } from "../src/lib/prisma.js";

function hoyMas(dias: number, horas: number, minutos = 0) {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(horas, minutos);
  return fecha;
}

// Las columnas `time` son DateTime en Prisma: se arma una fecha cualquiera con esa hora en UTC
// y Postgres guarda solo la hora ("09:00" → 09:00:00).
function hora(hhmm: string) {
  return new Date(`1970-01-01T${hhmm}:00.000Z`);
}

async function main() {
  await prisma.turno.deleteMany();
  await prisma.horarioDisponible.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.profesional.deleteMany();

  await prisma.profesional.createMany({
    data: [
      { id: "11111111-1111-4111-8111-111111111111", nombre: "Laura Gómez", especialidad: "Kinesiología", email: "laura@turnero.com" },
      { id: "22222222-2222-4222-8222-222222222222", nombre: "Martín Ruiz", especialidad: "Nutrición", email: "martin@turnero.com" },
      { id: "33333333-3333-4333-8333-333333333333", nombre: "Sofía Pérez", especialidad: "Psicología", email: "sofia@turnero.com" },
    ],
  });

  await prisma.cliente.createMany({
    data: [
      { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", nombre: "Carlos Méndez", email: "carlos@mail.com", telefono: "223-555-0101" },
      { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", nombre: "Lucía Fernández", email: "lucia@mail.com" },
    ],
  });

  await prisma.turno.createMany({
    data: [
      { profesionalId: "11111111-1111-4111-8111-111111111111", clienteId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", inicio: hoyMas(1, 10), fin: hoyMas(1, 10, 45) },
      { profesionalId: "11111111-1111-4111-8111-111111111111", clienteId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", inicio: hoyMas(1, 11), fin: hoyMas(1, 11, 45) },
      { profesionalId: "22222222-2222-4222-8222-222222222222", clienteId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", inicio: hoyMas(-3, 9), fin: hoyMas(-3, 9, 30), estado: "completado" },
    ],
  });

  await prisma.horarioDisponible.createMany({
  data: [
    ...[1, 2, 3, 4, 5].map((dia) => ({
      profesionalId: "11111111-1111-4111-8111-111111111111",
      diaSemana: dia,
      inicio: hora("09:00"),
      fin: hora("13:00"),
    })),
    { profesionalId: "22222222-2222-4222-8222-222222222222", diaSemana: 2, inicio: hora("14:00"), fin: hora("18:00") },
    { profesionalId: "22222222-2222-4222-8222-222222222222", diaSemana: 4, inicio: hora("14:00"), fin: hora("18:00") },
  ],
});

  console.log("Seed completado");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
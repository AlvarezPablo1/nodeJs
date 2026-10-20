export {};
const url = "http://localhost:3000/api/v1/turnos";

function reservar(clienteId: string) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profesionalId: "11111111-1111-4111-8111-111111111111",
      clienteId,
      inicio: "2026-10-21T09:00:00-03:00",
      duracion: 30,
    }),
  });
}

const [carlos, lucia] = await Promise.all([
  reservar("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
  reservar("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
]);

console.log("Carlos:", carlos.status, JSON.stringify((await carlos.json()).response?.result));
console.log("Lucía:", lucia.status, JSON.stringify((await lucia.json()).response?.result));
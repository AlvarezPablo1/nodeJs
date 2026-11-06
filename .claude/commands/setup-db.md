---
name: setup-db
description: Agrega PostgreSQL (Docker) + Prisma ORM 7 a una API ya creada con /setup-api, con el modelo Usuario que necesita el login, un modelo de ejemplo, seed con usuario admin, cliente y scripts. Usar cuando el usuario pida "/setup-db", "armar la base de datos" o "configurar Postgres con Prisma" en un proyecto. Requiere haber corrido /setup-api antes.
---

# /setup-db · PostgreSQL + Prisma 7

Objetivo: sobre una API creada con `/setup-api`, dejar una base PostgreSQL corriendo en Docker y Prisma 7 configurado de punta a punta, con el modelo `Usuario` que usa el módulo de autenticación, un modelo de ejemplo y un seed con un usuario admin. Al terminar, el proyecto compila, el login funciona, y el usuario solo tiene que reemplazar el modelo de ejemplo y los datos de prueba por los reales.

## Reglas generales

- **Esta skill va siempre después de `/setup-api`.** Si la estructura de la API no existe, se frena en el Paso 0 sin crear ni modificar nada.
- Usar **Prisma ORM 7** (fijar versión `@7`). No usar Prisma 8 aunque sea la última: es release candidate y cambia el modelo de trabajo.
- En Prisma 7 la URL de conexión **no va en `schema.prisma`**: va en el archivo de configuración (`prisma7.config.ts` o `prisma.config.ts`). El cliente **requiere driver adapter** (`@prisma/adapter-pg`).
- **Nunca sobrescribir un archivo existente sin preguntar.** Si ya hay `prisma/`, `compose.yaml` o `src/lib/prisma.ts`, mostrar lo que hay y preguntar si reemplazar, fusionar o saltear. El `.env`, el `.env.example` y `src/config/env.ts` ya existen (los crea `/setup-api`): a esos **se les agrega** lo necesario, nunca se reemplazan.
- **Nunca** correr `migrate reset` ni nada destructivo contra una base que no sea la local de Docker creada por esta skill.
- Nombres de archivos de código en **camelCase** (convención del usuario). Tablas y columnas en la base en **snake_case**, mapeadas con `@map` / `@@map`.
- Explicar brevemente cada paso al usuario mientras se ejecuta; está aprendiendo.

## Paso 0 · Verificar que `/setup-api` ya se corrió (antes de cualquier otra cosa)

Detectar la carpeta de la API (puede ser la raíz o una subcarpeta de un monorepo, por ejemplo `api/`) y verificar que existan **todos** estos elementos:

1. `package.json` con `express` entre las dependencias.
2. `src/app.ts`
3. `src/config/env.ts`
4. `src/shared/respuesta.ts`
5. `src/lib/jwt.ts`
6. La carpeta `src/modules/auth/`

Si falta **cualquiera** de ellos: **frenar la ejecución en este punto**, sin crear, instalar ni modificar nada, y responder exactamente con este mensaje, agregando la lista de lo que falta:

> Este proyecto todavía no tiene la estructura base de la API. `/setup-db` necesita que primero corras **`/setup-api`**, que crea Express, la configuración, el formato de respuestas y el login. Cuando termine, volvé a correr `/setup-db`.
>
> Falta: <lista de los elementos que no se encontraron>

No ofrecer crear la estructura a mano ni seguir "igual": la única salida es correr `/setup-api` primero.

Si está todo, avisar en una línea que la estructura de `/setup-api` está presente y seguir.

## Paso 1 · Relevamiento

1. Leer `package.json` (¿tiene `"type": "module"`?), `tsconfig.json` (valor de `module` y `moduleResolution`, `rootDir`, `include`) y `.gitignore`.
2. Leer `src/lib/jwt.ts` y anotar **los roles** que acepta su schema del token (por ejemplo `z.enum(["admin", "usuario"])`). El enum `Rol` de Prisma del Paso 7 tiene que tener **exactamente** esos valores.
3. Leer `src/modules/auth/auth.repository.ts` y anotar qué campos usa del modelo `usuario` (como mínimo `id`, `email`, `passwordHash`, `rol`). El modelo `Usuario` del Paso 7 tiene que tenerlos todos.
4. Leer `src/config/env.ts` y verificar si su schema ya incluye `DATABASE_URL`.
5. Los archivos de Docker van en la **raíz del repo**; todo lo de Prisma va en la **carpeta de la API**.
6. **Siempre** preguntarle al usuario, antes de crear cualquier archivo, cómo quiere configurar la base. Hacerlo en un solo mensaje, proponiendo valores por defecto (derivados del nombre de la carpeta raíz, en minúsculas y sin espacios) para que pueda aceptarlos o cambiarlos:
   - **Nombre de la base de datos** (`POSTGRES_DB`).
   - **Usuario** (`POSTGRES_USER`; default: el mismo nombre de la base).
   - **Contraseña** (`POSTGRES_PASSWORD`; default: el mismo nombre de la base, aclarando que es aceptable solo porque es una base local de desarrollo).
   - **Nombre del contenedor** (default: `<nombre-de-la-base>-db`).
   - **Puerto local** (default `5432`; si está ocupado, sugerir `5433`).

   No avanzar hasta tener la respuesta. Validar que el nombre de la base y el usuario usen solo minúsculas, números y guiones bajos (sin espacios, guiones medios ni acentos); si no cumplen, proponer una versión corregida y confirmarla.

   En el resto de esta skill, `<base>`, `<usuario>`, `<contraseña>`, `<contenedor>` y `<puerto>` se refieren a estos valores.
7. Verificar que Docker esté disponible con `docker --version` y `docker compose version`. Si no, frenar y decirle al usuario que instale Docker Desktop u OrbStack.

## Paso 2 · Docker

Crear `compose.yaml` en la raíz del repo con los valores que eligió el usuario:

```yaml
services:
  db:
    image: postgres:17
    container_name: <contenedor>
    environment:
      POSTGRES_USER: <usuario>
      POSTGRES_PASSWORD: <contraseña>
      POSTGRES_DB: <base>
      TZ: America/Argentina/Buenos_Aires
      PGTZ: America/Argentina/Buenos_Aires
    ports:
      - "<puerto>:5432"
    volumes:
      - <base>-db-data:/var/lib/postgresql/data

volumes:
  <base>-db-data:
```

Levantar con `docker compose up -d` desde la raíz y confirmar con `docker compose ps` que el contenedor está `running`.

## Paso 3 · Dependencias

Desde la carpeta de la API:

```bash
npm install @prisma/client@7 @prisma/adapter-pg pg
npm install -D prisma@7 @types/pg
```

`dotenv`, `tsx` y `argon2` ya los instala `/setup-api`. Verificarlo en el `package.json` y, solo si falta alguno, instalarlo (`dotenv` y `argon2` como dependencias, `tsx` como dependencia de desarrollo).

## Paso 4 · Inicializar Prisma

`prisma init` puede crear o modificar el `.env`. **Antes** de correrlo, guardar una copia del `.env` actual. Después, verificar que el `.env` conserve todas las variables que tenía (por ejemplo `JWT_SECRET`, `CORS_ORIGINS`) y restaurarlas si hiciera falta.

Si `tsconfig.json` tiene `rootDir: "src"` o `include: ["src"]`, el cliente generado tiene que ir dentro de `src`:

```bash
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

Ajustar el bloque `generator` de `prisma/schema.prisma` según el `tsconfig.json`:

- Si `moduleResolution` es `NodeNext` o `Node16` (imports con extensión `.js`):

```prisma
generator client {
  provider            = "prisma-client"
  output              = "../src/generated/prisma"
  moduleFormat        = "esm"
  importFileExtension = "js"
}
```

- Si es `bundler`, omitir `importFileExtension`.

El bloque `datasource` queda **sin** `url`:

```prisma
datasource db {
  provider = "postgresql"
}
```

## Paso 5 · Variables de entorno

**Agregar** al `.env` existente (sin tocar el resto, y asegurándose de que quede una sola `DATABASE_URL`):

```
DATABASE_URL="postgresql://<usuario>:<contraseña>@localhost:<puerto>/<base>?schema=public"
```

Si la contraseña tiene caracteres especiales (`@`, `:`, `/`, `#`, `%`), codificarlos en la URL (por ejemplo `@` → `%40`), porque si no la URL se interpreta mal.

**Agregar** al `.env.example` existente la misma clave con valores de ejemplo, nunca los reales:

```
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/base?schema=public"
```

Si el schema de `src/config/env.ts` **no** incluye `DATABASE_URL`, agregarlo junto a las demás variables:

```ts
DATABASE_URL: z.string().min(1, "Falta DATABASE_URL"),
```

Agregar al `.gitignore` de la raíz, si no están (ajustar la ruta si la API está en una subcarpeta):

```
.env
api/src/generated
```

## Paso 6 · Archivo de configuración de Prisma

Verificar que el archivo generado por `init` (`prisma7.config.ts` o `prisma.config.ts`) quede así, agregando el `seed`:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

Este archivo lo usa solo la línea de comandos de Prisma, por eso lee `process.env` directamente y no `src/config/env.ts`.

## Paso 7 · Modelos

Agregar a `schema.prisma` el modelo `Usuario` (requerido por el login de `/setup-api`) y un modelo genérico de ejemplo, pensado para ser reemplazado.

El enum `Rol` tiene que tener **exactamente** los roles anotados en el Paso 1 desde `src/lib/jwt.ts`. Si ahí son `admin` y `usuario`, queda así:

```prisma
enum Rol {
  admin
  usuario

  @@map("rol")
}

// Requerido por el módulo de autenticación de /setup-api. No borrar.
model Usuario {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String   @unique
  passwordHash  String   @map("password_hash")
  rol           Rol
  creadoEn      DateTime @default(now()) @map("creado_en") @db.Timestamptz(6)
  actualizadoEn DateTime @updatedAt @map("actualizado_en") @db.Timestamptz(6)

  @@map("usuarios")
}

// Modelo de ejemplo: reemplazalo por tus modelos reales.
model Ejemplo {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nombre        String
  descripcion   String?
  activo        Boolean  @default(true)
  creadoEn      DateTime @default(now()) @map("creado_en") @db.Timestamptz(6)
  actualizadoEn DateTime @updatedAt @map("actualizado_en") @db.Timestamptz(6)

  @@map("ejemplos")
}
```

Si `auth.repository.ts` usa algún campo más del usuario (anotado en el Paso 1), agregarlo al modelo.

## Paso 8 · Cliente de Prisma

Crear `src/lib/prisma.ts` usando las variables ya validadas de `src/config/env.ts` (usar `.js` en los imports si el proyecto usa `NodeNext`; sin extensión si usa `bundler`):

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.js";

// Sesión en UTC: el adapter manda las fechas en UTC sin zona horaria. Si la base usa otra
// (compose.yaml la pone en hora argentina), las interpreta en esa zona y las guarda corridas.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL, options: "-c timezone=UTC" });

export const prisma = new PrismaClient({ adapter });
```

Una sola instancia para toda la app. No hace falta chequear que exista `DATABASE_URL`: si falta, `config/env.ts` corta el arranque con un mensaje claro. **No sacar `options: "-c timezone=UTC"`**: sin eso, con `TZ`/`PGTZ` en el compose, las columnas `timestamptz` quedan corridas (un turno de las 12:30 se guarda como 15:30). La API no lo nota porque lee con el mismo error, pero las consultas SQL con `now()` dan mal.

## Paso 9 · Seed

Crear `prisma/seed.ts`, idempotente (borra y vuelve a cargar), con un usuario admin y datos de ejemplo:

```ts
import argon2 from "argon2";
import { prisma } from "../src/lib/prisma.js";

// REEMPLAZAR: credenciales del admin de desarrollo. Cambiarlas antes de compartir el proyecto.
const ADMIN_EMAIL = "admin@<base>.local";
const ADMIN_PASSWORD = "cambiar-esta-clave";

async function main() {
  // Borrar en orden inverso a las relaciones (primero las tablas que apuntan a otras).
  await prisma.ejemplo.deleteMany();
  await prisma.usuario.deleteMany();

  await prisma.usuario.create({
    data: {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddd01",
      email: ADMIN_EMAIL,
      passwordHash: await argon2.hash(ADMIN_PASSWORD),
      rol: "admin",
    },
  });

  // REEMPLAZAR: datos de prueba del modelo de ejemplo.
  await prisma.ejemplo.createMany({
    data: [
      { id: "11111111-1111-4111-8111-111111111111", nombre: "Primer ejemplo", descripcion: "Dato de prueba" },
      { id: "22222222-2222-4222-8222-222222222222", nombre: "Segundo ejemplo" },
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
```

Reemplazar `<base>` en el email del admin por el nombre elegido. Si el rol de administrador en `src/lib/jwt.ts` tiene otro nombre, usar ese. Usar ids fijos con formato UUID válido, para poder referenciarlos en el `requests.http`.

## Paso 10 · Scripts en package.json

Agregar (sin pisar scripts existentes con el mismo nombre; si existen, preguntar):

```json
"db:up": "docker compose up -d",
"db:migrate": "prisma migrate dev",
"db:generate": "prisma generate",
"db:seed": "prisma db seed",
"db:reset": "prisma migrate reset --force && prisma db seed",
"db:studio": "prisma studio"
```

Si el `compose.yaml` está en una carpeta superior, `docker compose` lo encuentra igual. Para pasarle argumentos a un script, van después de `--` (por ejemplo `npm run db:migrate -- --name agregar-campo`).

## Paso 11 · Primera migración y verificación

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

En Prisma 7, `migrate` no ejecuta `generate` ni el seed automáticamente: correr los tres.

Verificar, en este orden:

1. `npx tsc --noEmit` sin errores. Antes de esta skill el proyecto no compilaba (el login hacía referencia a una tabla que no existía); ahora tiene que compilar. Si hay errores en `src/modules/auth/`, casi siempre es un campo o un rol que no coincide entre el modelo `Usuario` y lo que usa el módulo: corregir el modelo, migrar y regenerar.
2. Con `npx prisma studio` o una consulta, confirmar que hay 1 usuario admin y 2 ejemplos.
3. Levantar la API con `npm run dev` y probar el login del admin (con REST Client o `curl`) contra `POST /api/v1/auth/login`, con las credenciales del seed. Tiene que responder con `response.result: true` y un token. Después, detener el servidor.

Si algo falla, mostrar el error completo al usuario y explicar la causa probable antes de reintentar.

## Paso 12 · Resumen final para el usuario

Terminar con un mensaje que tenga estas tres partes.

### 1. Qué se creó y dónde

Lista corta de archivos creados (`compose.yaml`, `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/`, el archivo de configuración de Prisma, `src/lib/prisma.ts`) y modificados (`.env`, `.env.example`, `src/config/env.ts` si hizo falta, `.gitignore`, `package.json`).

### 2. Datos que hay que reemplazar por los reales

Mostrar esta lista **completa**, con los valores concretos que se usaron en este proyecto, para que el usuario sepa exactamente qué cambiar y dónde:

| Dónde | Qué | Valor actual | Cuándo cambiarlo |
|---|---|---|---|
| `prisma/schema.prisma` | Modelo `Ejemplo` | modelo genérico | Antes de empezar a desarrollar: reemplazarlo por los modelos reales. **No borrar `Usuario`**. |
| `prisma/seed.ts` | Datos de `Ejemplo` | 2 registros de prueba | Junto con el modelo: cargar datos de prueba de los modelos reales. |
| `prisma/seed.ts` | Email y contraseña del admin | `<email usado>` / `cambiar-esta-clave` | Antes de compartir el proyecto o subirlo a un repo. |
| `compose.yaml` | `POSTGRES_USER` y `POSTGRES_PASSWORD` | `<usuario>` / `<contraseña>` | Válidos solo para desarrollo local. **Nunca** reutilizarlos en producción. |
| `compose.yaml` | `TZ` y `PGTZ` | `America/Argentina/Buenos_Aires` | Si el proyecto funciona en otra zona horaria. |
| `.env` | `DATABASE_URL` | apunta a `localhost:<puerto>` | En producción: reemplazarla por la URL de la base real que da el hosting (se configura en el panel del hosting, no en el `.env` del repo). |
| `.env.example` | `DATABASE_URL` | valores de ejemplo | No cambiarlo por valores reales: es documentación y va a Git. |

Y aclarar qué **no** se toca a mano: `src/generated/` (se regenera con `npm run db:generate`) y las migraciones ya aplicadas en `prisma/migrations/`.

### 3. Cómo reemplazar el modelo de ejemplo

1. Editar `prisma/schema.prisma` con los modelos reales (borrar `Ejemplo`, mantener `Usuario`).
2. Actualizar `prisma/seed.ts` con los datos de prueba de los nuevos modelos (borrando en orden inverso a las relaciones).
3. Si el proyecto todavía no se compartió ni se deployó, lo más limpio es borrar `prisma/migrations/` y correr `npm run db:migrate -- --name init`, `npm run db:generate` y `npm run db:seed`. Si ya se compartió, nunca borrar migraciones: crear una nueva con `npm run db:migrate -- --name <descripcion>`.
4. Si hacen falta reglas que el schema de Prisma no puede expresar (por ejemplo `CHECK` o `EXCLUDE`), crear la migración con `--create-only`, agregarlas al `migration.sql` y recién después aplicarla.

Recordatorio final: el `.env` no va a Git; el `.env.example` sí; la carpeta `prisma/migrations` sí; `src/generated` no.

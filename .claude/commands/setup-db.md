---
description: Configura desde cero PostgreSQL (Docker) + Prisma ORM 7 en un proyecto Node/TypeScript existente, con un modelo base de ejemplo, seed, cliente y scripts. Usar cuando el usuario pida "setear Prisma", "armar la base de datos" o "configurar Postgres con Prisma" en un proyecto.
---

# Setup de PostgreSQL + Prisma 7

Objetivo: dejar el proyecto con una base PostgreSQL corriendo en Docker y Prisma 7 configurado de punta a punta, con un modelo base de ejemplo. Al terminar, el usuario solo tiene que reemplazar el modelo de ejemplo por los suyos, migrar y correr el seed.

## Reglas generales

- Usar **Prisma ORM 7** (fijar versión `@7`). No usar Prisma 8 aunque sea la última: es release candidate y cambia el modelo de trabajo.
- En Prisma 7 la URL de conexión **no va en `schema.prisma`**: va en el archivo de configuración (`prisma7.config.ts` o `prisma.config.ts`). El cliente **requiere driver adapter** (`@prisma/adapter-pg`).
- **Nunca sobrescribir un archivo existente sin preguntar.** Si ya hay `prisma/`, `compose.yaml`, `.env` o `src/lib/prisma.ts`, mostrar lo que hay y preguntar si reemplazar, fusionar o saltear.
- **Nunca** correr `migrate reset` ni nada destructivo contra una base que no sea la local de Docker creada por esta skill.
- Nombres de archivos de código en **camelCase** (convención del usuario). Tablas y columnas en la base en **snake_case**, mapeadas con `@map` / `@@map`.
- Explicar brevemente cada paso al usuario mientras se ejecuta; está aprendiendo.

## Paso 0 · Relevamiento (antes de tocar nada)

1. Leer `package.json` (¿tiene `"type": "module"`?), `tsconfig.json` (valor de `module` y `moduleResolution`, `rootDir`, `include`) y `.gitignore`.
2. Detectar la raíz del repo y la carpeta de la API (puede ser un monorepo, por ejemplo `api/`). Los archivos de Docker van en la **raíz del repo**; todo lo de Prisma va en la **carpeta de la API**.
3. **Siempre** preguntarle al usuario, antes de crear cualquier archivo, cómo quiere configurar la base. Hacerlo en un solo mensaje, proponiendo valores por defecto (derivados del nombre de la carpeta raíz, en minúsculas y sin espacios) para que pueda aceptarlos o cambiarlos:
   - **Nombre de la base de datos** (`POSTGRES_DB`).
   - **Usuario** (`POSTGRES_USER`; default: el mismo nombre de la base).
   - **Contraseña** (`POSTGRES_PASSWORD`; default: el mismo nombre de la base, aclarando que es aceptable solo porque es una base local de desarrollo).
   - **Nombre del contenedor** (default: `<nombre-de-la-base>-db`).
   - **Puerto local** (default `5432`; si está ocupado, sugerir `5433`).

   No avanzar hasta tener la respuesta. Validar que el nombre de la base y el usuario usen solo minúsculas, números y guiones bajos (sin espacios, guiones medios ni acentos); si no cumplen, proponer una versión corregida y confirmarla.

   En el resto de esta skill, `<base>`, `<usuario>`, `<contraseña>`, `<contenedor>` y `<puerto>` se refieren a estos valores.
4. Verificar que Docker esté disponible con `docker --version` y `docker compose version`. Si no, frenar y decirle al usuario que instale Docker Desktop u OrbStack.

## Paso 1 · Docker

Crear `compose.yaml` en la raíz del repo con los valores que eligió el usuario en el Paso 0:

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

## Paso 2 · Dependencias

Desde la carpeta de la API:

```bash
npm install @prisma/client@7 @prisma/adapter-pg pg dotenv
npm install -D prisma@7 @types/pg tsx
```

## Paso 3 · Inicializar Prisma

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

## Paso 4 · Variables de entorno

`.env` (en la carpeta de la API):

```
DATABASE_URL="postgresql://<usuario>:<contraseña>@localhost:<puerto>/<base>?schema=public"
```

Si la contraseña tiene caracteres especiales (`@`, `:`, `/`, `#`, `%`), codificarlos en la URL (por ejemplo `@` → `%40`), porque si no la URL se interpreta mal.

Crear también `.env.example` con la misma clave y valores de ejemplo, para que quien clone el repo sepa qué configurar. El `.env.example` **sí** va a Git.

Agregar al `.gitignore` de la raíz, si no están (ajustar la ruta si la API está en una subcarpeta):

```
.env
api/src/generated
```

## Paso 5 · Archivo de configuración de Prisma

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

## Paso 6 · Modelo base de ejemplo

Agregar a `schema.prisma` un único modelo genérico, pensado para ser reemplazado:

```prisma
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

## Paso 7 · Cliente de Prisma

Crear `src/lib/prisma.ts` (usar `.js` en el import si el proyecto usa `NodeNext`; sin extensión si usa `bundler`):

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
```

Una sola instancia para toda la app.

## Paso 8 · Seed

Crear `prisma/seed.ts`, idempotente (borra y vuelve a cargar):

```ts
import { prisma } from "../src/lib/prisma.js";

async function main() {
  // Borrar en orden inverso a las relaciones (primero las tablas que apuntan a otras).
  await prisma.ejemplo.deleteMany();

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

Usar ids fijos con formato UUID válido, para poder referenciarlos en archivos de requests.

## Paso 9 · Scripts en package.json

Agregar (sin pisar scripts existentes con el mismo nombre; si existen, preguntar):

```json
"db:up": "docker compose up -d",
"db:migrate": "prisma migrate dev",
"db:generate": "prisma generate",
"db:seed": "prisma db seed",
"db:reset": "prisma migrate reset --force && prisma db seed",
"db:studio": "prisma studio"
```

Si el `compose.yaml` está en una carpeta superior, `docker compose` lo encuentra igual.

## Paso 10 · Primera migración y verificación

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

En Prisma 7, `migrate` no ejecuta `generate` ni el seed automáticamente: correr los tres.

Verificar:

1. `npx tsc --noEmit` sin errores.
2. Contar registros con un script rápido o con `npx prisma studio`: tienen que verse los 2 ejemplos.

Si algo falla, mostrar el error completo al usuario y explicar la causa probable antes de reintentar.

## Paso 11 · Resumen final para el usuario

Terminar con un mensaje corto que diga:

- Qué se creó y dónde (lista de archivos).
- Cómo reemplazar el modelo de ejemplo:
  1. Editar `prisma/schema.prisma` con los modelos reales (borrar `Ejemplo`).
  2. Actualizar `prisma/seed.ts` con los datos de prueba de los nuevos modelos.
  3. Correr `npm run db:reset` (reaplica migraciones y siembra) o, si se quiere conservar el historial, `npx prisma migrate dev --name <descripcion>` + `npx prisma generate` + `npm run db:seed`.
- Recordatorio: el `.env` no va a Git; el `.env.example` sí; la carpeta `prisma/migrations` sí; `src/generated` no.
- Si hacen falta reglas que el schema de Prisma no puede expresar (por ejemplo `CHECK`), crear la migración con `--create-only`, agregarlas al `migration.sql` y recién después aplicarla.

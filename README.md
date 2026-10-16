# 🗓️ Turnero

Apuntes personales del proceso de aprendizaje de **Node.js**, **Express** y **TypeScript** armando un sistema de turnos, organizados por lecciones.

## 📁 Estructura del proyecto

```
turnero/
├── api/          → backend (Node.js + Express + TypeScript) — ver estructura en la Lección 4
│   ├── sql/      → consultas SQL de práctica (Lección 5)
│   └── prisma/   → schema, migraciones y seed de Prisma (Lección 6)
├── web/          → frontend
└── compose.yaml  → define la base PostgreSQL en Docker
```

## 📚 Índice

| # | Lección | Tema |
|---|---------|------|
| 1 | [Setup y primer servidor](#-lección-1-setup-y-primer-servidor) | Proyecto Node con TypeScript, Express y primeros endpoints `GET` |
| 2 | [Rutas y CRUD en memoria](#-lección-2--rutas-y-crud-en-memoria) | CRUD de profesionales con `GET`, `POST`, `PUT` y `DELETE` sobre un array en memoria |
| 3 | [Middlewares y validación con Zod](#-lección-3--middlewares-y-validación-con-zod) | Middlewares propios (logger, validación de body/params/query, errores) y validación de datos con Zod |
| 4 | [Arquitectura en capas](#-lección-4--arquitectura-en-capas) | Separar el código en módulos y capas: routes, controller, service, repository; errores personalizados |
| 5 | [Docker y PostgreSQL](#-lección-5--docker-y-postgresql) | Base de datos en un contenedor, psql, tablas con claves, consultas SQL (`JOIN`, `UPDATE`, `DELETE`) y reglas en la base |
| 6 | [Prisma ORM](#-lección-6--prisma-orm) | Conectar la API a PostgreSQL con Prisma 7: schema, migraciones, cliente, seed y repository asíncrono |
| 7 | [Turnos, disponibilidad y respuestas uniformes](#-lección-7--turnos-disponibilidad-y-respuestas-uniformes) | Formato único de respuesta, códigos de error, `409` por email repetido, relaciones con `include`, paginación, índices y cálculo de horarios libres |

---

## 🚀 Lección 1: Setup y primer servidor

### 1) Crear el proyecto

Dentro de la carpeta `api`:

```bash
npm init -y
```

- Crea el **`package.json`**, el archivo que describe el proyecto: nombre, versión, scripts y dependencias.

### 2) Instalar dependencias

```bash
npm install express
npm install -D typescript tsx @types/node @types/express
```

- **`dependencies`** → lo que la app necesita para **funcionar** en producción.
- **`devDependencies`** (`-D`) → lo que solo se usa mientras **desarrollamos**.

| Paquete | Tipo | Para qué sirve |
|---------|------|----------------|
| `express` | dependencia | Framework para crear el servidor y los endpoints |
| `typescript` | dev | Compilador: transforma TypeScript (`.ts`) en JavaScript (`.js`) |
| `tsx` | dev | Ejecuta archivos `.ts` directamente, sin compilar antes |
| `@types/node` | dev | Tipos de Node para TypeScript |
| `@types/express` | dev | Tipos de Express para TypeScript (autocompletado y errores) |

### 3) Configurar el `package.json`

```json
"type": "module",
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

- **`"type": "module"`** → habilita la sintaxis moderna de módulos (`import` / `export`) en vez de `require`.
- **Scripts:**

  | Comando | Qué hace |
  |---------|----------|
  | `npm run dev` | Levanta el servidor en modo desarrollo; con `watch` se reinicia solo cada vez que guardás un cambio |
  | `npm run build` | Compila `src/` (TypeScript) a `dist/` (JavaScript) |
  | `npm start` | Corre la versión compilada (la que se usaría en producción) |

### 4) Configurar TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "rootDir": "src",
    "outDir": "dist",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- **`target`** → versión de JavaScript que se genera al compilar.
- **`module` / `moduleResolution: NodeNext`** → usa el sistema de módulos de Node moderno (combina con `"type": "module"`).
- **`strict`** → activa todos los chequeos de tipos estrictos (más errores detectados antes de correr).
- **`rootDir` / `outDir`** → el código fuente vive en `src/` y el compilado se guarda en `dist/`.
- **`esModuleInterop`** → permite hacer `import express from "express"` con librerías antiguas.
- **`skipLibCheck`** → no revisa los tipos de las librerías de `node_modules` (compila más rápido).

### 5) Crear el servidor (`src/server.ts`)

```ts
import express from "express";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
```

- **`express()`** → crea la aplicación (el servidor).
- **`PORT`** → puerto en el que el servidor "escucha" las peticiones.
- **`app.listen(PORT, callback)`** → arranca el servidor; el callback se ejecuta una vez que ya está escuchando.

### 6) Primeros endpoints (`GET`)

Un **endpoint** es una URL a la que se le puede hacer una petición. Se define con el **método HTTP** + la **ruta** + la función que responde:

```ts
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
```

- **`app.get(ruta, (req, res) => {})`** → responde a peticiones `GET` en esa ruta.
  - **`req`** (request) → lo que **llega**: parámetros, query, body, headers.
  - **`res`** (response) → lo que **devolvemos**.
- **`res.status(200)`** → código de estado HTTP (`200` = OK).
- **`.json({...})`** → responde con un objeto en formato JSON.
- **`/api/v1/...`** → convención para versionar la API: si en el futuro cambia, se crea `v2` sin romper a quien use `v1`.

| Endpoint | Qué devuelve |
|----------|--------------|
| `GET /api/v1/health` | Estado del servidor + fecha/hora (sirve para chequear que está vivo) |
| `GET /api/v1/info` | Nombre y versión del proyecto |
| `GET /api/v1/greeting/:name` | Un saludo personalizado |

### 7) Parámetros de ruta y query params

```ts
app.get("/api/v1/greeting/:name", (req, res) => {
  const { name } = req.params;
  const isFormal = req.query.formal === "true";
  const message = isFormal ? `Good day, ${name}.` : `Hello, ${name}!`;

  res.status(200).json({ message });
});
```

- **Parámetro de ruta (`:name`)** → parte **obligatoria** de la URL; se lee con `req.params`.
- **Query param (`?formal=true`)** → dato **opcional** después del `?`; se lee con `req.query`.
  - Los query params **siempre llegan como `string`**, por eso se compara con `"true"` y no con `true`.
- **Destructuring** → `const { name } = req.params` saca la propiedad `name` del objeto en una sola línea.
- **Ternario** → `condición ? siEsVerdadero : siEsFalso`.

| Petición | Respuesta |
|----------|-----------|
| `/api/v1/greeting/Pablo` | `{ "message": "Hello, Pablo!" }` |
| `/api/v1/greeting/Pablo?formal=true` | `{ "message": "Good day, Pablo." }` |

### 8) Probarlo

```bash
cd api
npm run dev
```

Y en el navegador (o con `curl`):

```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/greeting/Pablo?formal=true
```

> **💡 Dato extra:** gracias a `tsx watch` no hace falta cortar y volver a levantar el servidor: cada vez que guardás `server.ts` se reinicia solo.

---

## 🧩 Lección 2 · Rutas y CRUD en memoria

**CRUD** = **C**reate, **R**ead, **U**pdate, **D**elete: las cuatro operaciones básicas sobre un recurso. En esta lección las armamos para los **profesionales** del turnero, guardándolos en un array **en memoria** (todavía sin base de datos).

| Operación | Método HTTP | Ruta | Código de éxito |
|-----------|-------------|------|-----------------|
| Listar | `GET` | `/api/v1/profesionales` | `200 OK` |
| Ver uno | `GET` | `/api/v1/profesionales/:id` | `200 OK` |
| Crear | `POST` | `/api/v1/profesionales` | `201 Created` |
| Actualizar | `PUT` | `/api/v1/profesionales/:id` | `200 OK` |
| Eliminar | `DELETE` | `/api/v1/profesionales/:id` | `204 No Content` |

### 1) Middleware para leer JSON

```ts
app.use(express.json());
```

- Un **middleware** es una función que se ejecuta **antes** de llegar al endpoint, en cada petición.
- **`express.json()`** lee el body de la petición y lo convierte en objeto → queda disponible en **`req.body`**.
- Sin esto, `req.body` es `undefined` en los `POST` y `PUT`.

### 2) Tipo y "base de datos" en memoria

```ts
import { randomUUID } from "node:crypto";

type Profesional = {
  id: string;
  nombre: string;
  especialidad: string;
  email: string;
};

let profesionales: Profesional[] = [
  { id: randomUUID(), nombre: "Laura Gómez", especialidad: "Kinesiología", email: "laura@turnero.com" },
  { id: randomUUID(), nombre: "Martín Ruiz", especialidad: "Nutrición", email: "martin@turnero.com" },
];
```

- **`type`** → define la "forma" que tiene que tener un objeto; TypeScript avisa si falta o sobra algo.
- **`Profesional[]`** → un array de profesionales.
- **`randomUUID()`** → genera un id único (ej: `946c0af0-2da3-48e9-...`), viene incluido en Node (`node:crypto`).
- **En memoria** → los datos viven en una variable: **se pierden cada vez que el servidor se reinicia** (y con `tsx watch` eso pasa en cada guardado, por eso los ids cambian).

### 3) Leer (`GET`)

```ts
app.get("/api/v1/profesionales", (req, res) => {
  res.status(200).json(profesionales);
});

app.get("/api/v1/profesionales/:id", (req, res) => {
  const { id } = req.params;
  const profesional = profesionales.find((p) => p.id === id);

  if (profesional) {
    res.status(200).json(profesional);
  } else {
    res.status(404).json({ error: "Profesional no encontrado" });
  }
});
```

- **`.find(condición)`** → devuelve el **primer elemento** que cumple la condición, o `undefined` si no hay ninguno.
- **`404 Not Found`** → el recurso pedido no existe.

#### Filtrar por query param

```ts
const { especialidad } = req.query;
const resultado = especialidad
  ? profesionales.filter((p) => p.especialidad === especialidad)
  : profesionales;
```

- **`.filter(condición)`** → devuelve un **array nuevo** con todos los que cumplen (puede estar vacío).
- Ej: `GET /api/v1/profesionales?especialidad=Nutrición`.

> **⚠️ Ojo:** si se registran **dos** `app.get` con la misma ruta, Express usa **solo el primero** que encuentra; el segundo nunca se ejecuta. El filtro tiene que ir **dentro** del mismo endpoint de listar.

### 4) Crear (`POST`)

```ts
app.post("/api/v1/profesionales", (req, res) => {
  const { nombre, especialidad, email } = req.body;

  if (!nombre || !especialidad || !email) {
    return res.status(400).json({ error: "nombre, especialidad y email son obligatorios" });
  }

  const nuevo: Profesional = { id: randomUUID(), nombre, especialidad, email };
  profesionales.push(nuevo);

  res.status(201).json(nuevo);
});
```

- Los datos llegan en el **body** (gracias a `express.json()`).
- **Validación** → si falta algo, se corta con **`400 Bad Request`** (el cliente mandó datos inválidos).
- **`return res...`** → el `return` corta la función para que no siga ejecutando y no responda dos veces.
- **`{ nombre, especialidad }`** → *shorthand*: equivale a `{ nombre: nombre, especialidad: especialidad }`.
- **`.push()`** → agrega al final del array.
- **`201 Created`** → se creó un recurso nuevo; se devuelve el objeto creado (con su `id`).

### 5) Actualizar (`PUT`)

```ts
app.put("/api/v1/profesionales/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, especialidad, email } = req.body;
  const index = profesionales.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Profesional no encontrado" });
  }
  if (!nombre || !especialidad || !email) {
    return res.status(400).json({ error: "nombre, especialidad y email son obligatorios" });
  }

  profesionales[index] = { id, nombre, especialidad, email };
  res.status(200).json(profesionales[index]);
});
```

- **`.find()` vs `.findIndex()`** → `find` devuelve el **objeto**; `findIndex` devuelve su **posición** en el array (o **`-1`** si no existe). Para reemplazar necesitamos la posición.
- **`PUT`** → reemplaza el recurso **completo**, por eso se piden todos los campos.

### 6) Eliminar (`DELETE`)

```ts
app.delete("/api/v1/profesionales/:id", (req, res) => {
  const { id } = req.params;
  const index = profesionales.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Profesional no encontrado" });
  }

  profesionales.splice(index, 1);
  res.status(204).send();
});
```

- **`.splice(posición, cantidad)`** → elimina elementos del array a partir de esa posición.
- **`204 No Content`** → salió bien pero no hay nada para devolver; se usa **`.send()`** en vez de `.json()`.

### 7) Ruta no encontrada (404 genérico)

```ts
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    ruta: `${req.method} ${req.originalUrl}`,
  });
});
```

- Un `app.use` **sin ruta** atrapa cualquier petición.
- Tiene que ir **al final**, después de todos los endpoints: Express revisa las rutas **en orden** y solo llega acá si ninguna coincidió.

### 8) Códigos de estado usados

| Código | Significado | Cuándo |
|--------|-------------|--------|
| `200` | OK | Lectura o actualización exitosa |
| `201` | Created | Se creó un recurso |
| `204` | No Content | Se eliminó y no hay body |
| `400` | Bad Request | Faltan datos o son inválidos |
| `404` | Not Found | El id o la ruta no existen |

### 9) Probarlo con `requests.http`

En `api/requests.http` están todas las peticiones listas para ejecutar desde el editor (extensión **REST Client** de VS Code: aparece un botón *Send Request* arriba de cada una).

```http
@baseUrl = http://localhost:3000/api/v1

### Crear profesional
POST {{baseUrl}}/profesionales
Content-Type: application/json

{
  "nombre": "Sofía Paz",
  "especialidad": "Psicología",
  "email": "sofia@turnero.com"
}
```

- **`@baseUrl`** → variable reutilizable con `{{baseUrl}}`.
- **`###`** → separa una petición de otra.
- **`Content-Type: application/json`** → le avisa al servidor que el body es JSON (necesario para que `express.json()` lo lea).

> **💡 Dato extra:** como los ids se generan de nuevo en cada reinicio, antes de probar `GET /:id`, `PUT` o `DELETE` hay que listar los profesionales y copiar un id real.

---

## 🔐 Lección 3 · Middlewares y validación con Zod

En la lección anterior validábamos a mano (`if (!nombre || ...)`) dentro de cada endpoint. Ahora sacamos esa lógica a **middlewares reutilizables** y usamos **Zod** para describir cómo tienen que ser los datos.

### 1) ¿Qué es un middleware?

Una función con la forma **`(req, res, next) => {}`** que se ejecuta **en el medio** entre que llega la petición y responde el endpoint. Puede:

- **Seguir** → llamar a **`next()`** para pasar al siguiente middleware/endpoint.
- **Cortar** → responder (`res.status(...).json(...)`) y no llamar a `next()`.

```
petición → express.json() → logger → validarParams → validarBody → endpoint → respuesta
```

- **`app.use(middleware)`** → se aplica a **todas** las rutas.
- **`app.get(ruta, middleware1, middleware2, handler)`** → se aplica **solo** a esa ruta, en el orden en que se escriben.

### 2) Seguridad básica: ocultar `X-Powered-By`

```ts
app.disable("x-powered-by");
```

- Por defecto Express agrega el header `X-Powered-By: Express` a cada respuesta.
- Desactivarlo evita dar pistas sobre la tecnología del servidor.

### 3) Middleware de logging

```ts
app.use((req, res, next) => {
  const inicio = Date.now();

  res.on("finish", () => {
    const duracion = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} X-response-time: ${duracion}ms`);
  });

  next();
});
```

- **`Date.now()`** → milisegundos actuales; se guarda al entrar la petición.
- **`res.on("finish", ...)`** → se ejecuta cuando la respuesta **ya se envió**, así conocemos el `statusCode` final y cuánto tardó.
- **`next()`** → sin esto la petición quedaría "colgada" y nunca llegaría al endpoint.

Ejemplo en consola:

```
GET /api/v1/profesionales → 200 X-response-time: 2ms
```

### 4) Zod: esquemas de validación

```bash
npm install zod
```

- **Zod** permite definir un **schema** (la forma esperada de los datos) y validar cualquier objeto contra él.
- Va en `dependencies` (no `-D`) porque se usa **en tiempo de ejecución**, no solo al desarrollar.

```ts
import { z } from "zod";

const idSchema = z.object({
  id: z.uuid("El ID debe ser un UUID válido"),
});

const profesionalSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  especialidad: z.string().trim().min(2, "La especialidad es obligatoria"),
  email: z.email("El email no es válido"),
});
```

| Regla | Qué valida |
|-------|------------|
| `z.object({...})` | Que sea un objeto con esas propiedades |
| `z.string()` | Que sea texto |
| `.trim()` | Saca espacios al principio y al final **antes** de validar |
| `.min(2, "msg")` | Largo mínimo, con mensaje de error propio |
| `z.email()` | Que tenga formato de email |
| `z.uuid()` | Que tenga formato de UUID |
| `z.enum(["a", "b"])` | Que sea uno de esos valores |
| `.optional()` | Que pueda no venir |

### 5) Tipos a partir del schema (`z.infer`)

```ts
type ProfesionalInput = z.infer<typeof profesionalSchema>;
type Profesional = ProfesionalInput & { id: string };
```

- **`z.infer`** → genera el tipo de TypeScript **desde el schema**: una sola fuente de verdad, no hay que escribir el `type` a mano y mantener los dos sincronizados.
- **`&`** (intersección) → combina tipos: `Profesional` = todo lo de `ProfesionalInput` **+** `id`.

### 6) Middlewares de validación reutilizables

```ts
import type { Request, Response, NextFunction } from "express";

function validarBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        detalles: resultado.error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensaje: issue.message,
        })),
      });
    }

    req.body = resultado.data;
    next();
  };
}
```

- **Función que devuelve un middleware** → así se puede reusar con cualquier schema: `validarBody(profesionalSchema)`.
- **`safeParse()`** → valida **sin tirar excepción**; devuelve `{ success: true, data }` o `{ success: false, error }`.
  - (`parse()` en cambio tira un error si no valida.)
- **`error.issues`** → lista de problemas; con `.map()` se arma una respuesta clara por campo.
- **`req.body = resultado.data`** → reemplaza el body por los datos **ya limpios** (por ejemplo, con el `trim` aplicado).
- **`validarParams`** es igual pero valida `req.params` (se usa para chequear que el `:id` sea un UUID).
- **`import type`** → importa solo tipos; no genera código en el JavaScript final.

Respuesta ante datos inválidos:

```json
{
  "error": "Datos inválidos",
  "detalles": [
    { "campo": "email", "mensaje": "El email no es válido" }
  ]
}
```

### 7) Endpoints más limpios

```ts
app.post("/api/v1/profesionales", validarBody(profesionalSchema), (req, res) => {
  const nuevo: Profesional = { id: randomUUID(), ...req.body };
  profesionales.push(nuevo);
  res.status(201).json(nuevo);
});

app.put("/api/v1/profesionales/:id", validarParams(idSchema), validarBody(profesionalSchema), (req, res) => {
  // si llega acá, el id y el body ya son válidos
});
```

- El endpoint ya **no valida nada**: si se ejecuta es porque los middlewares dejaron pasar la petición.
- **Spread (`...req.body`)** → copia todas las propiedades del body dentro del nuevo objeto.
- Un id con formato inválido ahora da **`400`** (antes daba `404`); un UUID válido que no existe sigue dando **`404`**.

### 8) Middleware de manejo de errores (500)

```ts
import type { ErrorRequestHandler } from "express";

const manejadorDeErrores: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
};

app.use(manejadorDeErrores); // al final de todo
```

- Express lo reconoce como manejador de errores porque recibe **4 parámetros** (`err` primero).
- Atrapa cualquier error no controlado en los endpoints y responde **`500 Internal Server Error`** en vez de romper o mostrar el stack al cliente.
- Va **al final**, después del 404 genérico.

**Orden final en `server.ts`:**

1. `app.disable("x-powered-by")`
2. `express.json()`
3. Logger
4. Endpoints (con sus middlewares de validación)
5. 404 genérico (ruta no encontrada)
6. Manejador de errores (500)

### 9) Validar query params (`validarQuery`) y `res.locals`

```ts
const greetingQuerySchema = z.object({
  formal: z.enum(["true", "false"]).optional().transform((val) => val === "true"),
});

function validarQuery(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.query);

    if (!resultado.success) {
      return res.status(400).json({ error: "Query inválido", detalles: /* ... */ });
    }

    res.locals.query = resultado.data;
    next();
  };
}

app.get("/api/v1/greeting/:name", validarQuery(greetingQuerySchema), (req, res) => {
  const { name } = req.params;
  const { formal } = res.locals.query as z.infer<typeof greetingQuerySchema>;

  const message = formal ? `Good day, ${name}.` : `Hello, ${name}!`;
  res.status(200).json({ message });
});
```

- **`z.enum(["true", "false"])`** → el query param solo puede ser `"true"` o `"false"`; cualquier otro valor (ej: `?formal=si`) da **`400`**.
- **`.optional()`** → si no se manda `formal`, no hay error.
- **`.transform(fn)`** → después de validar, **convierte** el valor: el string `"true"` pasa a ser el boolean `true` (y `"false"` o ausente → `false`). Así el endpoint ya recibe un `boolean`, no un string.
- **`res.locals`** → objeto para **pasar datos** de un middleware a los siguientes durante una misma petición.
  - Se usa en vez de `req.query = resultado.data` porque en **Express 5 `req.query` es de solo lectura** (se recalcula cada vez que se lee), así que no se puede pisar como hacemos con `req.body`.
- **`as z.infer<typeof greetingQuerySchema>`** → `res.locals` no tiene tipos (`any`); con `as` le decimos a TypeScript qué forma tiene, así `formal` queda tipado como `boolean`.

| Petición | Respuesta |
|----------|-----------|
| `/greeting/Pablo` | `200` → `{ "message": "Hello, Pablo!" }` |
| `/greeting/Pablo?formal=true` | `200` → `{ "message": "Good day, Pablo." }` |
| `/greeting/Pablo?formal=si` | `400` → `{ "error": "Query inválido", ... }` |

> **💡 Dato extra:** probá en `requests.http` crear un profesional con `"email": "no-es-un-email"`, pedir `GET /profesionales/123` o `GET /greeting/Pablo?formal=si`: vas a ver el `400` con el detalle de qué campo falló.

---

## 🧱 Lección 4 · Arquitectura en capas

Hasta ahora todo vivía en `server.ts` (más de 200 líneas). A medida que la API crece eso se vuelve inmanejable, así que lo **separamos en archivos por responsabilidad** y agrupamos todo lo de un recurso en un **módulo**.

### 1) Nueva estructura

```
api/src/
├── server.ts                      → solo levanta el servidor (app.listen)
├── app.ts                         → arma la app: middlewares + rutas
├── errors/
│   └── appError.ts                → errores personalizados (AppError, NotFoundError)
├── middlewares/
│   ├── logger.ts
│   ├── validar.ts                 → un único middleware para params, query y body
│   ├── rutaNoEncontrada.ts        → 404 genérico
│   └── manejadorDeErrores.ts      → traduce errores a respuestas HTTP
├── shared/
│   └── schemas.ts                 → schemas reutilizables (idParamsSchema)
└── modules/
    └── profesionales/
        ├── profesionales.routes.ts
        ├── profesionales.controller.ts
        ├── profesionales.service.ts
        ├── profesionales.repository.ts
        └── profesionales.schema.ts
```

### 2) Las capas y cómo viaja una petición

```
petición → routes → validar → controller → service → repository → datos
                                   ↑            │
                         respuesta  └── throw NotFoundError → manejadorDeErrores
```

| Capa | Responsabilidad | Sabe de HTTP (`req`/`res`)? |
|------|-----------------|------------------------------|
| **routes** | Qué método + ruta llama a qué controller, y con qué validación | Sí |
| **controller** | Leer datos de la petición, llamar al service y responder | Sí |
| **service** | Reglas de negocio (ej: "si no existe → error 404") | **No** |
| **repository** | Acceso a los datos (hoy un array, mañana una base de datos) | **No** |
| **schema** | Schemas de Zod y tipos derivados | No |

- **Ventaja clave:** cada capa se puede cambiar sin tocar las otras. Cuando pasemos a una base de datos real, solo cambia el **repository**.
- Convención de nombres: **`<modulo>.<capa>.ts`** → es fácil encontrar cualquier archivo.

#### 🍽️ Analogía: un restaurante

Pensá en un restaurante:

- **El mozo (controller)** habla con el cliente: toma el pedido en el idioma del cliente y le lleva el plato. **No cocina ni decide nada.**
- **El cocinero (service)** sabe las reglas: qué lleva cada plato, que no se sirve pescado si no está fresco, que el postre sin TACC va aparte. **No habla con clientes.**
- **La heladera y la despensa (repository)** guardan los ingredientes. **No saben de recetas**; solo tienen o no tienen lo que les piden.

| Restaurante | Capa | En el turnero |
|-------------|------|---------------|
| Mozo | controller | Lee `req`, llama al service y responde con `res` |
| Cocinero | service | Si el profesional no existe → `throw new NotFoundError(...)` |
| Heladera / despensa | repository | Busca, agrega o borra en el array; devuelve lo que hay (o `undefined`) |

Si mañana el restaurante empieza a tomar pedidos **por una app** en vez de con mozos, el cocinero sigue igual. Si cambian la heladera por una **cámara frigorífica**, ni el mozo ni el cocinero se enteran.

> En código: si cambiamos Express por otro framework, solo cambian las **routes** y el **controller**; si cambiamos el array por una base de datos, solo cambia el **repository**. El **service** no se toca en ninguno de los dos casos.

### 3) `server.ts` vs `app.ts`

```ts
// app.ts
export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(logger);

app.use("/api/v1/profesionales", profesionalesRouter);

app.use(rutaNoEncontrada);
app.use(manejadorDeErrores);
```

```ts
// server.ts
import { app } from "./app.js";

app.listen(PORT, () => { ... });
```

- **`app.ts`** configura la aplicación pero **no** la levanta.
- **`server.ts`** solo hace `app.listen`.
- Separarlos permite, más adelante, **importar `app` en los tests** sin abrir un puerto real.
- **`export` / `import`** → así se comparte código entre archivos.
- **`.js` en los imports** → aunque el archivo sea `.ts`, con `"module": "NodeNext"` hay que escribir la extensión del archivo **compilado**.

### 4) Router: rutas por módulo

```ts
// profesionales.routes.ts
export const profesionalesRouter = Router();

profesionalesRouter.get("/", validar({ query: listarProfesionalesQuerySchema }), profesionalesController.listar);
profesionalesRouter.get("/:id", validar({ params: idParamsSchema }), profesionalesController.obtener);
profesionalesRouter.post("/", validar({ body: profesionalSchema }), profesionalesController.crear);
profesionalesRouter.put("/:id", validar({ params: idParamsSchema, body: profesionalSchema }), profesionalesController.actualizar);
profesionalesRouter.delete("/:id", validar({ params: idParamsSchema }), profesionalesController.eliminar);
```

- **`Router()`** → un "mini app" con sus propias rutas.
- **`app.use("/api/v1/profesionales", profesionalesRouter)`** → lo **monta** bajo ese prefijo: `"/"` pasa a ser `/api/v1/profesionales` y `"/:id"` pasa a ser `/api/v1/profesionales/:id`.
- De un vistazo se ven **todas** las rutas del módulo.

### 5) Un solo middleware `validar`

```ts
type Schemas = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

export function validar(schemas: Schemas) {
  return (req, res, next) => {
    for (const parte of ["params", "query", "body"] as const) {
      const schema = schemas[parte];
      if (!schema) continue;

      const resultado = schema.safeParse(req[parte]);
      if (!resultado.success) {
        return res.status(400).json({ error: "Datos inválidos", ubicacion: parte, detalles: /* ... */ });
      }

      if (parte === "body") req.body = resultado.data;
      if (parte === "query") res.locals.query = resultado.data;
    }
    next();
  };
}
```

- Reemplaza a `validarParams`, `validarQuery` y `validarBody` (que eran casi idénticos) → **DRY** (*Don't Repeat Yourself*).
- Recibe un objeto con los schemas que hagan falta: `validar({ params: ..., body: ... })`.
- **`as const`** → TypeScript toma el array como los valores exactos `"params" | "query" | "body"`, así `schemas[parte]` y `req[parte]` quedan bien tipados.
- **`continue`** → salta a la siguiente vuelta del `for` si esa parte no tiene schema.
- **`ubicacion`** en la respuesta → indica si el error estuvo en `params`, `query` o `body`.

### 6) Controller

```ts
export const profesionalesController = {
  listar(req: Request, res: Response) {
    const { especialidad } = res.locals.query as ListarProfesionalesQuery;
    res.json(profesionalesService.listar({ especialidad }));
  },

  obtener(req: Request<IdParams>, res: Response) {
    res.json(profesionalesService.obtener(req.params.id));
  },
  // crear, actualizar, eliminar...
};
```

- Métodos **cortos**: toman datos de `req`, llaman al service y responden. Nada de lógica de negocio.
- **`res.json(...)`** sin `.status()` → usa `200` por defecto.
- **`Request<IdParams>`** → tipa `req.params`, así TypeScript sabe que `req.params.id` es un `string`.
- Se agrupan en un **objeto** (`profesionalesController.listar`, `.obtener`, ...) en vez de funciones sueltas.

### 7) Service: reglas de negocio + errores

```ts
export const profesionalesService = {
  obtener(id: string) {
    const profesional = profesionalesRepository.buscarPorId(id);
    if (!profesional) throw new NotFoundError("Profesional");
    return profesional;
  },
  // ...
};
```

- **No sabe nada de HTTP**: no usa `req` ni `res`. Si algo sale mal, **lanza un error** (`throw`).
- Ya no hace falta repetir `if (...) return res.status(404)...` en cada endpoint.
- **Express 5** atrapa automáticamente los errores lanzados en los handlers y los manda al **manejador de errores**.

### 8) Repository: acceso a datos

```ts
const profesionales: Profesional[] = [
  { id: "11111111-1111-4111-8111-111111111111", nombre: "Laura Gómez", ... },
  { id: "22222222-2222-4222-8222-222222222222", nombre: "Martín Ruiz", ... },
];

export const profesionalesRepository = {
  listar(filtro: { especialidad?: string } = {}) {
    if (!filtro.especialidad) return profesionales;
    return profesionales.filter((p) => p.especialidad === filtro.especialidad);
  },
  buscarPorId(id: string) { ... },       // → Profesional | undefined
  crear(datos: ProfesionalInput) { ... },
  actualizar(id, datos) { ... },         // → Profesional | undefined
  eliminar(id: string) { ... },          // → true | false
};
```

- Es el **único** lugar que toca el array. El resto de la app no sabe dónde se guardan los datos.
- Devuelve `undefined` / `false` cuando no encuentra algo, y el **service** decide qué hacer con eso.
- **IDs fijos** en los datos de ejemplo → ya no cambian con cada reinicio, así se pueden dejar escritos en `requests.http`.
- **`= {}`** → valor por defecto del parámetro si no se pasa nada.

### 9) Errores personalizados (`AppError`)

```ts
export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(recurso: string) {
    super(404, `${recurso} no encontrado`);
  }
}
```

- **`class ... extends Error`** → crea un tipo de error propio que además guarda el **código HTTP**.
- **`super(...)`** → llama al constructor de la clase padre.
- **`readonly`** → la propiedad no se puede modificar después de crearla.
- **`NotFoundError`** es un `AppError` con `404` ya fijo: `new NotFoundError("Profesional")` → `"Profesional no encontrado"`.

### 10) Manejador de errores mejorado

```ts
export const manejadorDeErrores: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El body no es un JSON válido" });
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
};
```

- **`instanceof`** → chequea si el error es de nuestra clase (o de una hija, como `NotFoundError`); si lo es, usa su `status` y `message`.
- **`entity.parse.failed`** → el error que tira `express.json()` cuando el body es un JSON mal escrito → ahora responde `400` en vez de `500`.
- Cualquier otro error es **inesperado** → se loguea y se responde `500` sin mostrar detalles al cliente.

### 11) Probar todos los casos con `requests.http`

Con los ids fijos del repository, `requests.http` pasa a ser una **batería de pruebas manuales**: cubre el camino feliz y también cada error que la API tiene que devolver.

#### Variables

```http
@baseUrl = http://localhost:3000/api/v1
@idLaura = 11111111-1111-4111-8111-111111111111
@idMartin = 22222222-2222-4222-8222-222222222222
@idInexistente = 99999999-9999-4999-8999-999999999999

### Ver uno
GET {{baseUrl}}/profesionales/{{idLaura}}
```

- Se declaran una vez con **`@nombre = valor`** y se usan con **`{{nombre}}`**.
- **`@idInexistente`** → un UUID **válido** que no existe: pasa la validación de Zod pero el service tira `404`.

#### Peticiones con nombre: encadenar resultados

```http
### 1. Crear profesional
# @name crear
POST {{baseUrl}}/profesionales
Content-Type: application/json

{ "nombre": "Sofía Pérez", "especialidad": "Psicología", "email": "sofia@turnero.com" }

### 2. Ver el recién creado
GET {{baseUrl}}/profesionales/{{crear.response.body.id}}
```

- **`# @name crear`** → le da nombre a la petición.
- **`{{crear.response.body.id}}`** → toma el `id` de **la respuesta** de esa petición. No hace falta copiar y pegar ids a mano.
- Así se arma un **flujo completo** que se ejecuta en orden: crear → ver → actualizar → eliminar (`204`) → ver de nuevo (`404`).

#### Qué casos cubre

| Caso | Ejemplo | Esperado | Quién responde |
|------|---------|----------|----------------|
| Filtro sin resultados | `?especialidad=Odontología` | `200` con `[]` | repository (`filter` vacío) |
| Id mal formado | `/profesionales/hola` | `400` | `validar` (params) |
| UUID válido que no existe | `/profesionales/{{idInexistente}}` | `404` | service → `NotFoundError` |
| Faltan campos | `{ "nombre": "Sin especialidad" }` | `400` | `validar` (body) |
| Email inválido | `"email": "esto-no-es-un-email"` | `400` | Zod `z.email()` |
| Nombre muy corto | `"nombre": "J"` | `400` | Zod `.min(2)` |
| Nombre solo espacios | `"nombre": "   "` | `400` | Zod `.trim()` + `.min(2)` |
| JSON mal escrito | coma de más al final | `400` | `manejadorDeErrores` (`entity.parse.failed`) |
| Campo extra | `"esAdmin": true` | `201` sin `esAdmin` | Zod descarta lo que no está en el schema |
| Ruta con typo | `/profesionalez` | `404` "Ruta no encontrada" | `rutaNoEncontrada` |

- **Campo extra:** por defecto `z.object()` **elimina** las propiedades que no están en el schema. Como guardamos `resultado.data` en `req.body`, alguien no puede "colar" datos como `esAdmin` en nuestro array. Es una protección que viene gratis por usar Zod.
- **`"   "` falla** porque `.trim()` se aplica **antes** que `.min(2)`: queda `""`, que tiene largo 0.

> **💡 Dato extra:** para agregar un recurso nuevo (ej: turnos) alcanza con copiar la carpeta `modules/profesionales` como `modules/turnos`, adaptar cada capa y montar su router en `app.ts`.

---

## 🐘 Lección 5 · Docker y PostgreSQL

Hasta ahora los datos vivían en un array y se perdían en cada reinicio. El siguiente paso es una **base de datos real**: **PostgreSQL**, corriendo dentro de **Docker** para no tener que instalarla en la máquina.

### 1) Imagen, contenedor y volumen

| Concepto | Qué es | Analogía | En el turnero |
|----------|--------|----------|---------------|
| **Imagen** | Plantilla de solo lectura con todo lo necesario para correr un programa (sistema base + programa + configuración) | La **receta** | `postgres:17` |
| **Contenedor** | Una imagen **en ejecución**: un proceso aislado creado a partir de la imagen. Se puede crear, frenar y borrar | El **plato** hecho con la receta | `turnero-db` |
| **Volumen** | Carpeta que Docker guarda **fuera** del contenedor, para que los datos **sobrevivan** aunque el contenedor se borre | El **freezer**: el plato se tira, lo guardado queda | `turnero-db-data` |

- De una misma imagen se pueden crear muchos contenedores.
- Sin volumen, al borrar el contenedor **se pierde la base completa**.

### 2) `compose.yaml`

```yaml
services:
  db:
    image: postgres:17
    container_name: turnero-db
    environment:
      POSTGRES_USER: turnero
      POSTGRES_PASSWORD: turnero
      POSTGRES_DB: turnero
      TZ: America/Argentina/Buenos_Aires
      PGTZ: America/Argentina/Buenos_Aires
    ports:
      - "5432:5432"
    volumes:
      - turnero-db-data:/var/lib/postgresql/data

volumes:
  turnero-db-data:
```

- **`services`** → los contenedores del proyecto (por ahora solo `db`).
- **`image`** → qué imagen usar; si no está descargada, Docker la baja sola.
- **`environment`** → variables que la imagen de Postgres usa para crear el usuario, la contraseña y la base al arrancar por primera vez. `TZ`/`PGTZ` fijan la zona horaria.
- **`ports: "5432:5432"`** → `puerto_de_mi_máquina:puerto_del_contenedor`. Permite conectarse desde afuera en `localhost:5432`.
- **`volumes`** → monta el volumen en la carpeta donde Postgres guarda sus datos.

> ⚠️ Estas credenciales son solo para desarrollo local. En producción irían en variables de entorno (`.env`), nunca escritas en el repo.

### 3) Comandos de Docker

| Comando | Qué hace |
|---------|----------|
| `docker compose up -d` | Crea y arranca los contenedores de `compose.yaml`. **`-d`** (*detached*) = en segundo plano, devuelve la terminal |
| `docker compose ps` | Lista los contenedores del proyecto y su estado (`Up`, `Exited`...) |
| `docker compose logs db` | Muestra lo que imprimió el contenedor; con **`-f`** queda siguiendo los logs en vivo (salir con `Ctrl+C`) |
| `docker compose stop` | **Frena** los contenedores sin borrarlos; `up -d` los vuelve a arrancar igual que estaban |
| `docker compose down` | Frena **y borra** los contenedores (el volumen, y por lo tanto los datos, se conservan) |
| `docker compose down -v` | Igual que `down` pero **también borra los volúmenes** → ⚠️ **se pierde toda la base**. Útil para empezar de cero |

### 4) psql: la consola de Postgres

Para entrar a la base que está dentro del contenedor:

```bash
docker exec -it turnero-db psql -U turnero -d turnero
```

- **`docker exec -it`** → ejecuta un comando dentro de un contenedor que ya está corriendo, de forma interactiva.
- **`-U`** → usuario, **`-d`** → base de datos.

| Comando | Qué hace |
|---------|----------|
| `\dt` | Lista las tablas (*describe tables*) |
| `\d turnos` | Describe una tabla: columnas, tipos, claves, restricciones |
| `\q` | Sale de psql |

- Los comandos con `\` son **de psql**, no SQL: no llevan `;`.
- Las sentencias SQL (`SELECT`, `INSERT`...) **sí** terminan en `;`. Si te olvidás, psql espera (el prompt cambia de `turnero=#` a `turnero-#`).

Para ejecutar un archivo `.sql` entero sin entrar a la consola:

```bash
docker exec -i turnero-db psql -U turnero -d turnero < api/sql/consultas.sql
```

> ⚠️ En esta lección las tablas y los datos se creaban con `api/sql/01_esquema.sql` y `api/sql/02_datos.sql`. Desde la **Lección 6** esos scripts se borraron: las tablas las crean las **migraciones de Prisma** y los datos, el **seed**. Los fragmentos de SQL de abajo quedan como referencia.

### 5) Las tablas (`api/sql/01_esquema.sql`)

```sql
CREATE TABLE profesionales (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       text NOT NULL,
  especialidad text NOT NULL,
  email        text NOT NULL UNIQUE,
  creado_en    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE turnos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id uuid NOT NULL REFERENCES profesionales(id) ON DELETE NO ACTION,
  cliente_id     uuid NOT NULL REFERENCES clientes(id) ON DELETE NO ACTION,
  inicio         timestamptz NOT NULL,
  fin            timestamptz NOT NULL,
  estado         text NOT NULL DEFAULT 'confirmado'
                 CHECK (estado IN ('confirmado', 'cancelado', 'completado')),
  creado_en      timestamptz NOT NULL DEFAULT now(),
  CHECK (fin > inicio)
);
```

| Elemento | Qué hace |
|----------|----------|
| `uuid`, `text`, `timestamptz`, `time`, `smallint` | Tipos de dato. `timestamptz` = fecha y hora **con zona horaria** |
| `NOT NULL` | La columna es obligatoria |
| `DEFAULT ...` | Valor si no se manda: `gen_random_uuid()` genera el id, `now()` la fecha actual |
| `UNIQUE` | No puede haber dos filas con el mismo valor (ej: email) |
| `CHECK (...)` | Condición que toda fila tiene que cumplir |
| `DROP TABLE IF EXISTS` | Borra la tabla si existe, para poder correr el script varias veces |

- Las tablas son **`profesionales`**, **`clientes`**, **`turnos`** y **`horarios_disponibles`** (qué días y en qué franja atiende cada profesional; `dia_semana` va de `0` a `6`).
- **Orden de los `DROP`:** primero se borran las tablas que **apuntan** a otras (`turnos`, `horarios_disponibles`) y al final las apuntadas (`profesionales`, `clientes`). Si no, Postgres no deja borrar: `cannot drop table profesionales because other objects depend on it`.

### 6) Clave primaria y clave foránea

- **Clave primaria (`PRIMARY KEY`)** → la columna que **identifica de forma única** cada fila. No se puede repetir ni ser `NULL`. Es como el DNI de la fila. En todas las tablas es `id`.
- **Clave foránea (`REFERENCES`)** → una columna que **apunta a la clave primaria de otra tabla**. Es la forma de relacionar tablas.
  - `turnos.profesional_id REFERENCES profesionales(id)` → cada turno pertenece a un profesional que **tiene que existir**.
  - La base no deja crear un turno para un profesional inexistente ni borrar un profesional que tiene turnos.

```
profesionales (id) ◄──── turnos (profesional_id)
clientes      (id) ◄──── turnos (cliente_id)
profesionales (id) ◄──── horarios_disponibles (profesional_id)
```

**¿Qué pasa al borrar la fila apuntada?** (`ON DELETE`)

| Opción | Comportamiento | Dónde lo usamos |
|--------|----------------|-----------------|
| `NO ACTION` / `RESTRICT` | **Impide** el borrado si hay filas que la referencian | `turnos`: no se puede borrar un profesional o cliente con turnos (se pierde el historial) |
| `CASCADE` | Borra **también** las filas que la referencian | `horarios_disponibles`: si se borra el profesional, sus horarios ya no sirven |

### 7) Consultas (`api/sql/consultas.sql`)

```sql
-- Algunas columnas, filtradas y ordenadas
SELECT nombre, email FROM profesionales
WHERE especialidad = 'Kinesiología'
ORDER BY nombre;

-- Turnos de mañana
SELECT * FROM turnos
WHERE inicio >= date_trunc('day', now()) + interval '1 day'
  AND inicio <  date_trunc('day', now()) + interval '2 days'
ORDER BY inicio;
```

- **`SELECT columnas FROM tabla`** → qué traer (`*` = todas).
- **`WHERE`** → filtra filas. **`ORDER BY`** → ordena.
- **`date_trunc('day', now())`** → hoy a las 00:00. **`interval '1 day'`** → una duración que se suma o resta a una fecha.
- **Alias** → `FROM turnos t` permite escribir `t.inicio`; `p.nombre AS profesional` renombra la columna en el resultado.

### 8) `JOIN` vs `LEFT JOIN`

```sql
-- JOIN: cada turno con el nombre del profesional y del cliente
SELECT t.inicio, t.estado, p.nombre AS profesional, c.nombre AS cliente
FROM turnos t
JOIN profesionales p ON p.id = t.profesional_id
JOIN clientes c ON c.id = t.cliente_id
ORDER BY t.inicio;

-- LEFT JOIN: profesionales SIN turnos
SELECT p.nombre, COUNT(t.id) AS cantidad
FROM profesionales p
LEFT JOIN turnos t ON p.id = t.profesional_id
GROUP BY p.id
HAVING COUNT(t.id) = 0;
```

| | `JOIN` (`INNER JOIN`) | `LEFT JOIN` |
|-|------------------------|-------------|
| Devuelve | Solo las filas que **tienen pareja en las dos tablas** | **Todas** las filas de la tabla de la izquierda, tengan pareja o no |
| Si no hay pareja | La fila **desaparece** del resultado | Las columnas de la derecha vienen en **`NULL`** |
| Ejemplo | Sofía (sin turnos) **no aparece** | Sofía **aparece** con `cantidad = 0` |

- **"Izquierda"** = la tabla del `FROM`; **"derecha"** = la del `LEFT JOIN`.
- **`GROUP BY`** → junta las filas por un valor para calcular algo por grupo (**`COUNT`**, `SUM`, `AVG`...).
- **`HAVING`** → como `WHERE`, pero filtra **grupos**, después de agrupar.
- **`COUNT(t.id)`** vs **`COUNT(*)`** → `COUNT(t.id)` no cuenta los `NULL`, por eso da `0` para quien no tiene turnos; `COUNT(*)` daría `1`.

### 9) `UPDATE` y `DELETE`: la regla del `WHERE`

```sql
UPDATE profesionales SET especialidad = 'Kinesiología Deportiva'
WHERE email = 'laura@turnero.com';

DELETE FROM clientes WHERE email = 'no-existe@mail.com';
```

> ⚠️ **Regla de oro:** un `UPDATE` o `DELETE` **sin `WHERE`** afecta a **todas las filas** de la tabla. `DELETE FROM clientes;` borra todos los clientes, sin preguntar y sin deshacer.

Hábitos para no romper nada:

1. **Primero el `SELECT`** con el mismo `WHERE`, para ver qué filas se van a tocar. Recién después cambiarlo por `UPDATE`/`DELETE`.
2. **Filtrar por algo único** (`id` o `email`), no por algo que se puede repetir como `nombre`.
3. **Mirar la respuesta**: psql dice cuántas filas tocó (`UPDATE 1`, `DELETE 0`). Si el número no es el esperado, algo anda mal.
4. Para cambios delicados: **`BEGIN;`** → cambio → revisar → **`COMMIT;`** para confirmar o **`ROLLBACK;`** para deshacer.

### 10) Probar las reglas (`api/sql/consultas_invalidas.sql`)

Cada sentencia de este archivo **tiene que fallar**. Si alguna pasa, falta una regla en la base.

| Intento | Regla que lo frena | Error de Postgres |
|---------|--------------------|-------------------|
| Profesional con email repetido | `UNIQUE` | `duplicate key value violates unique constraint "profesionales_email_key"` |
| Turno para un profesional inexistente | `REFERENCES` | `violates foreign key constraint "turnos_profesional_id_fkey"` |
| Turno que termina antes de empezar | `CHECK (fin > inicio)` | `violates check constraint "turnos_check"` |
| Estado `'perdido'` | `CHECK (estado IN (...))` | `violates check constraint "turnos_estado_check"` |
| Borrar un profesional con turnos | `ON DELETE NO ACTION` | `update or delete on table "profesionales" violates foreign key constraint ... is still referenced from table "turnos"` |

### 11) ¿Por qué las reglas viven en el servicio **y** en la base?

Parece repetido: Zod ya valida el email y el service ya devuelve `404`. Pero cada lugar cumple un rol distinto:

| | Service / Zod | Base de datos |
|-|---------------|---------------|
| **Para qué** | Dar una **buena respuesta** al cliente: `400`/`404`/`409` con un mensaje claro | Ser la **última garantía**: los datos nunca quedan inválidos |
| **Cuándo actúa** | Antes de llegar a la base (rápido, sin consultas de más) | Siempre, venga el dato de donde venga |
| **Puede saltearse?** | Sí: un script, alguien en psql, otro servicio, un bug | **No**: todo dato que entra pasa por las restricciones |

- **Solo en el service** → alguien que se conecta directo a la base (o un bug) puede guardar datos rotos.
- **Solo en la base** → funciona, pero el usuario recibe un `500` con un mensaje técnico en vez de un `400` claro.
- **Concurrencia:** dos peticiones al mismo tiempo pueden pasar las dos el chequeo del service ("¿existe este email? no") y querer guardar el mismo email. Solo el `UNIQUE` de la base lo frena de verdad.

> 🍽️ Siguiendo la analogía del restaurante: el **cocinero** revisa que el pescado esté fresco antes de cocinarlo, pero la **heladera** igual tiene que mantenerlo frío. Si el cocinero se distrae una vez, la heladera sigue cuidando la comida.

> **💡 Dato extra:** con `npm run db:reset` (Lección 6) se vuelve a tener una base limpia con los datos de prueba en segundos.

---

## 🔷 Lección 6 · Prisma ORM

En la Lección 5 escribimos SQL a mano. Ahora la API deja el array en memoria y guarda los profesionales en **PostgreSQL** usando **Prisma**, sin escribir SQL en el código.

### 1) ¿Qué es un ORM?

Un **ORM** (*Object-Relational Mapping*) traduce entre **objetos de TypeScript** y **filas de la base**:

```ts
// Sin ORM: SQL a mano, el resultado no tiene tipos
await pool.query("SELECT * FROM profesionales WHERE especialidad = $1", ["Nutrición"]);

// Con Prisma: autocompletado y tipos en todo
await prisma.profesional.findMany({ where: { especialidad: "Nutrición" } });
```

- TypeScript sabe qué columnas existen: un typo (`especialida`) es un **error al compilar**, no en producción.
- Prisma arma el SQL y se encarga de los parámetros (sin riesgo de *SQL injection*).

### 2) Piezas nuevas

```
api/
├── .env                      → DATABASE_URL real (NO va a Git)
├── .env.example              → plantilla de .env (SÍ va a Git)
├── prisma7.config.ts         → configuración de Prisma: dónde está el schema, URL, seed
├── prisma/
│   ├── schema.prisma         → los modelos (tablas) escritos en el lenguaje de Prisma
│   ├── migrations/           → historial de cambios en la base, en SQL (SÍ va a Git)
│   └── seed.ts               → carga datos de prueba
└── src/
    ├── lib/prisma.ts         → la única instancia del cliente de Prisma
    └── generated/prisma/     → cliente generado por `prisma generate` (NO va a Git)
```

Dependencias:

| Paquete | Tipo | Para qué |
|---------|------|----------|
| `prisma` | dev | La CLI: `migrate`, `generate`, `db seed`, `studio` |
| `@prisma/client` | dependencia | Base del cliente que usa la app |
| `@prisma/adapter-pg` + `pg` | dependencia | **Driver adapter**: en Prisma 7 el cliente se conecta a Postgres a través del driver `pg` |
| `dotenv` | dependencia | Carga las variables de `.env` en `process.env` |

### 3) Variables de entorno: `.env` y `.env.example`

```bash
# api/.env.example
DATABASE_URL="postgresql://turnero:turnero@localhost:5432/turnero?schema=public"
```

- **`DATABASE_URL`** → `postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE?schema=public`.
- **`.env`** tiene los valores **reales** y está en el `.gitignore`: las contraseñas nunca se suben al repo.
- **`.env.example`** es la **plantilla**: mismas claves con valores de ejemplo. Quien clone el repo hace `cp .env.example .env` y ajusta lo que necesite.
- **`import "dotenv/config"`** → lee el `.env` y carga cada línea en `process.env`.

### 4) `schema.prisma`: los modelos

```prisma
generator client {
  provider            = "prisma-client"
  output              = "../src/generated/prisma"
  importFileExtension = "js"
  moduleFormat        = "esm"
}

datasource db {
  provider = "postgresql"
}

model Profesional {
  id           String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nombre       String
  especialidad String
  email        String              @unique
  creadoEn     DateTime            @default(now()) @map("creado_en") @db.Timestamptz(6)
  turnos       Turno[]
  horarios     HorarioDisponible[]

  @@map("profesionales")
}

model Turno {
  id            String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  profesionalId String      @map("profesional_id") @db.Uuid
  estado        EstadoTurno @default(confirmado)
  // ...
  profesional Profesional @relation(fields: [profesionalId], references: [id], onDelete: NoAction)

  @@map("turnos")
}
```

| Elemento | Qué hace | Equivalente en SQL (Lección 5) |
|----------|----------|-------------------------------|
| `model Profesional` | Define una tabla | `CREATE TABLE` |
| `@id` | Clave primaria | `PRIMARY KEY` |
| `@default(...)` | Valor por defecto | `DEFAULT` |
| `@unique` | Valor no repetible | `UNIQUE` |
| `String?` | El `?` la hace opcional | sin `NOT NULL` |
| `@db.Uuid`, `@db.Timestamptz(6)` | Tipo exacto en Postgres | `uuid`, `timestamptz` |
| `@relation(fields, references)` | Clave foránea | `REFERENCES` |
| `onDelete: NoAction` / `Cascade` | Qué pasa al borrar | `ON DELETE ...` |
| `enum EstadoTurno` | Lista cerrada de valores | `CHECK (estado IN (...))` |

- **Dos nombres:** en TypeScript se usa **camelCase** (`creadoEn`, `Profesional`); en la base, **snake_case** (`creado_en`, `profesionales`). **`@map`** traduce una columna y **`@@map`** la tabla.
- **Campos de relación** (`turnos Turno[]`, `profesional Profesional`) → **no** son columnas: le dicen a Prisma cómo navegar entre tablas.
- **`datasource` sin `url`** → en Prisma 7 la conexión se configura en `prisma7.config.ts`.
- **`generator`** → dónde y cómo generar el cliente. `importFileExtension = "js"` y `moduleFormat = "esm"` lo hacen compatible con `"module": "NodeNext"`.

### 5) Migraciones

Una **migración** es un archivo SQL con **un cambio** a la base. Prisma las genera comparando `schema.prisma` con lo que ya se aplicó.

```bash
npx prisma migrate dev --name init   # crea prisma/migrations/<fecha>_init/migration.sql y lo aplica
```

- Quedan en Git → cualquiera recrea la misma base aplicando las migraciones en orden.
- **Nunca se editan una vez aplicadas**: para cambiar algo se crea una migración nueva.
- **Reglas que Prisma no sabe escribir** (como los `CHECK`): se crea la migración con **`--create-only`**, se agregan al `migration.sql` y recién después se aplica:

```sql
-- Reglas que el schema de Prisma no puede expresar
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_fin_mayor_que_inicio" CHECK ("fin" > "inicio");
ALTER TABLE "horarios_disponibles" ADD CONSTRAINT "horarios_dia_semana_valido" CHECK ("dia_semana" BETWEEN 0 AND 6);
```

| Comando | Qué hace |
|---------|----------|
| `npx prisma migrate dev --name <nombre>` | Crea una migración nueva a partir del schema y la aplica |
| `npx prisma generate` | Genera el cliente en `src/generated/prisma` (correr después de cada cambio al schema) |
| `npx prisma db seed` | Ejecuta el seed configurado en `prisma7.config.ts` |
| `npm run db:reset` | ⚠️ Borra la base, reaplica todas las migraciones y corre el seed |
| `npx prisma studio` | Abre una interfaz web para ver y editar los datos |

> En **Prisma 7**, `migrate dev` **no** corre `generate` ni el seed solo: hay que ejecutarlos aparte.

### 6) Configuración (`prisma7.config.ts`) y cliente (`src/lib/prisma.ts`)

```ts
// prisma7.config.ts → lo usa la CLI
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

```ts
// src/lib/prisma.ts → lo usa la app
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

- **Una sola instancia** para toda la app: cada `new PrismaClient()` abre sus propias conexiones.
- **Fallar al arrancar** si falta `DATABASE_URL` es mejor que fallar en la primera petición con un error confuso.

### 7) Seed: datos de prueba

```ts
async function main() {
  // Primero se borran las tablas que apuntan a otras
  await prisma.turno.deleteMany();
  await prisma.horarioDisponible.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.profesional.deleteMany();

  await prisma.profesional.createMany({ data: [ /* ids fijos */ ] });
  // ...
}
```

- **Idempotente** → borra y vuelve a cargar: se puede correr las veces que haga falta y siempre deja lo mismo.
- **Ids fijos** (`1111...`, `2222...`) → los mismos que usa `requests.http`.
- **Columnas `time`** (`inicio`/`fin` de horarios) → en Prisma son `DateTime`, no aceptan `"09:00"`. Se pasa una fecha con esa hora **en UTC** y Postgres guarda solo la hora:

```ts
function hora(hhmm: string) {
  return new Date(`1970-01-01T${hhmm}:00.000Z`); // "09:00" → 09:00:00
}
```

### 8) El repository ahora es asíncrono

```ts
export const profesionalesRepository = {
  listar(filtro: { especialidad?: string } = {}) {
    return prisma.profesional.findMany({
      where: { especialidad: filtro.especialidad },
      orderBy: { nombre: "asc" },
    });
  },

  buscarPorId(id: string) {
    return prisma.profesional.findUnique({ where: { id } });
  },

  async actualizar(id: string, datos: ProfesionalInput) {
    try {
      return await prisma.profesional.update({ where: { id }, data: datos });
    } catch (error) {
      if (esNoEncontrado(error)) return null;
      throw error;
    }
  },
  // crear, eliminar...
};
```

| Método de Prisma | Qué hace | Si no encuentra |
|------------------|----------|-----------------|
| `findMany({ where, orderBy })` | Lista filas filtradas y ordenadas | Devuelve `[]` |
| `findUnique({ where: { id } })` | Busca por un campo único | Devuelve `null` |
| `create({ data })` | Inserta y devuelve la fila creada | — |
| `update({ where, data })` | Modifica y devuelve la fila | **Lanza error `P2025`** |
| `delete({ where })` | Borra la fila | **Lanza error `P2025`** |

- **`where: { especialidad: undefined }`** → Prisma **ignora** los filtros `undefined`, así que sin `?especialidad=` trae todos. Ya no hace falta el `if`.
- **`P2025`** → el código de error de Prisma para "registro no encontrado". El repository lo traduce a `null`/`false` para que el service siga funcionando igual que con el array.
- **Todo devuelve `Promise`** → hablar con la base lleva tiempo.

### 9) `async` / `await` en todas las capas

```ts
// service
async obtener(id: string) {
  const profesional = await profesionalesRepository.buscarPorId(id);
  if (!profesional) throw new NotFoundError("Profesional");
  return profesional;
}

// controller
async obtener(req: Request<IdParams>, res: Response) {
  res.json(await profesionalesService.obtener(req.params.id));
}
```

- Una **`Promise`** es un valor que **va a llegar más adelante**. **`await`** espera a que llegue, y solo se puede usar dentro de una función **`async`**.
- Si una capa se vuelve asíncrona, **las de arriba también**: repository → service → controller.
- **Sin `await`**, `profesional` sería la `Promise` (que siempre es "verdadera"): el `if (!profesional)` nunca daría `404` y para un id inexistente se respondería `200` con `null`.
- **Express 5** atrapa los errores de funciones `async` (un `throw` o una `Promise` rechazada) y los manda al `manejadorDeErrores`, igual que en la Lección 4.

> 🍽️ **Analogía:** cambiamos la **heladera** (array) por una **cámara frigorífica** (PostgreSQL). Tal como prometía la Lección 4, las rutas y la validación no cambiaron; el service y el controller solo tuvieron que aprender a **esperar** (`await`), porque ir a buscar a la cámara tarda más que abrir la heladera.

> **💡 Para arrancar desde cero** después de clonar el repo:
> ```bash
> cp api/.env.example api/.env
> docker compose up -d
> cd api && npm install
> npx prisma migrate dev && npx prisma generate && npx prisma db seed
> npm run dev
> ```

---

## 📅 Lección 7 · Turnos, disponibilidad y respuestas uniformes

La API suma el módulo de **turnos** (solo lectura por ahora) y un endpoint que calcula los **horarios libres** de un profesional. De paso, todas las respuestas pasan a tener **el mismo formato**.

### 1) Nuevos archivos

```
api/src/
├── shared/respuesta.ts       → responderOk, responderNegativo, responderError
└── modules/
    ├── turnos/               → routes, controller, service, repository, schema
    └── horarios/
        └── horarios.repository.ts   → solo repository: lo usa el service de turnos
```

- **`horarios/`** no tiene rutas propias: es un módulo "interno" que otro service consulta. No hace falta crear las cinco capas si no se usan.

### 2) Un formato único de respuesta (`shared/respuesta.ts`)

Antes, cada endpoint devolvía algo distinto: a veces el objeto, a veces `{ error }`, a veces nada (`204`). Ahora **todas** las respuestas tienen tres partes:

```jsonc
{
  "meta":     { "endpoint": "/api/v1/turnos", "metodo": "GET", "status": 200, /* extras */ },
  "response": { "result": true, "data": [ /* ... */ ] },
  "error":    null
}
```

| Función | Cuándo | `status` | `response` | `error` |
|---------|--------|----------|------------|---------|
| `responderOk(res, data, { status?, meta? })` | Salió bien | `200` (o el que se pase, ej. `201`) | `{ result: true, data }` | `null` |
| `responderNegativo(res, description, data?, { meta? })` | La petición es válida pero la respuesta es "no" | `200` | `{ result: false, description, data }` | `null` |
| `responderError(res, status, { description, codigo, detalles? })` | Algo falló | `4xx` / `5xx` | `null` | `{ status, description, codigo, detalles? }` |

```ts
function construirMeta(res: Response, status: number, extra: Meta = {}) {
  return {
    endpoint: res.req.originalUrl.split("?")[0], // sin el query
    metodo: res.req.method,
    status,
    ...extra, // paginación, fecha, duración...
  };
}
```

- **Quien consume la API** (el frontend) siempre sabe dónde mirar: `response.data` si salió bien, `error` si no.
- **`res.req`** → desde la respuesta se puede llegar a la petición, así que no hace falta pasar `req` a cada función.
- **`...extra`** → el *spread* copia todas las propiedades de `extra` dentro del objeto. Así cada endpoint agrega su propia info a `meta`.
- **Negativo ≠ error:** "el profesional no atiende ese día" no es un error del cliente ni del servidor; es una respuesta válida que dice que no. Por eso es `200` con `result: false`.
- **`DELETE`** ahora responde `200` con `data: null` en vez de `204`, porque un `204` no puede llevar body y se perdería el formato.

Los middlewares también usan `responderError`:

```ts
// manejadorDeErrores.ts
if (err instanceof AppError) {
  return responderError(res, err.status, { description: err.message, codigo: err.codigo });
}
```

### 3) Códigos de error

`AppError` ahora tiene un **`codigo`**: un texto fijo, en mayúsculas, que el frontend puede comparar sin depender del mensaje (que puede cambiar o traducirse).

```ts
export class AppError extends Error {
  readonly status: number;
  readonly codigo: string;

  constructor(status: number, codigo: string, message: string) { /* ... */ }
}

export class NotFoundError extends AppError {
  constructor(recurso: string) {
    super(404, "NO_ENCONTRADO", `${recurso} no encontrado`);
  }
}

export class ConflictError extends AppError {
  constructor(mensaje: string) {
    super(409, "CONFLICTO", mensaje);
  }
}
```

| `codigo` | Status | Lo genera |
|----------|--------|-----------|
| `DATOS_INVALIDOS` | `400` | `validar` (Zod) |
| `JSON_INVALIDO` | `400` | `manejadorDeErrores` |
| `NO_ENCONTRADO` | `404` | `NotFoundError` |
| `RUTA_NO_ENCONTRADA` | `404` | `rutaNoEncontrada` |
| `CONFLICTO` | `409` | `ConflictError` |
| `ERROR_INTERNO` | `500` | `manejadorDeErrores` (cualquier error no previsto) |

### 4) Email repetido → `409 Conflict`

La columna `email` es `@unique`. Si se crea o actualiza un profesional con un email que ya existe, la base lo rechaza y Prisma lanza el error **`P2002`**. Sin atraparlo, terminaba en un `500` genérico. Ahora el repository lo traduce:

```ts
function esDuplicado(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

const emailRepetido = () => new ConflictError("Ya existe un profesional con ese email");

async crear(datos: ProfesionalInput) {
  try {
    return await prisma.profesional.create({ data: datos });
  } catch (error) {
    if (esDuplicado(error)) throw emailRepetido();
    throw error; // cualquier otro error sigue de largo → 500
  }
},
```

- **`P2025` vs `P2002`:** para "no encontrado" el repository devuelve `null` y el service decide el `404`. Para el duplicado **tira el error directamente**, porque si devolviera `null` el service no podría distinguir "no existe" de "email repetido".
- **`409 Conflict`** → la petición es válida, pero choca con el estado actual de los datos.
- Es lo que anticipaba la Lección 5 (punto 11): la regla vive en la base (`UNIQUE`), y la API traduce el rechazo a un mensaje claro.

### 5) Turnos: relaciones con `include` y paginación

```ts
const incluirResumen = {
  profesional: { select: { id: true, nombre: true, especialidad: true } },
  cliente: { select: { id: true, nombre: true } },
} satisfies Prisma.TurnoInclude;

listar(filtros, pagina, porPagina) {
  const where: Prisma.TurnoWhereInput = {
    profesionalId: filtros.profesionalId,
    clienteId: filtros.clienteId,
    estado: filtros.estado,
    inicio: { gte: filtros.desde, lt: filtros.hasta },
  };

  return prisma.$transaction([
    prisma.turno.findMany({
      where,
      include: incluirResumen,
      orderBy: { inicio: "asc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.turno.count({ where }),
  ]);
},
```

| Pieza | Qué hace | Equivalente en SQL |
|-------|----------|--------------------|
| `include` | Trae también las filas relacionadas (profesional y cliente) | `JOIN` |
| `select` dentro del `include` | Solo esas columnas (no el email del cliente, por ejemplo) | `SELECT p.id, p.nombre...` |
| `gte` / `lt` | Mayor o igual / menor que | `>=` / `<` |
| `skip` / `take` | Saltear N filas / traer N filas | `OFFSET` / `LIMIT` |
| `count({ where })` | Cuántas filas cumplen el filtro (para saber el total de páginas) | `SELECT count(*)` |
| `$transaction([...])` | Ejecuta las dos consultas juntas y con los mismos datos | `BEGIN ... COMMIT` |

- **`satisfies Prisma.TurnoInclude`** → TypeScript verifica que el objeto sea un `include` válido, pero **sin perder** el tipo exacto: así sabe que el resultado tiene `profesional.nombre` pero no `profesional.email`.
- **Paginación:** página 2 de a 10 → `skip: 10, take: 10`. El service arma `meta` con `{ pagina, porPagina, total, totalPaginas: Math.ceil(total / porPagina) }`.
- **`?desde`** se compara con `gte` (incluido) y **`?hasta`** con `lt` (excluido): así dos rangos seguidos (`1 al 15` y `15 al 30`) no repiten turnos.

El schema del query valida todo y usa **`z.coerce`**, porque en la URL todo llega como texto:

```ts
export const listarTurnosQuerySchema = z.object({
    profesionalId: z.uuid().optional(),
    estado: z.enum(["confirmado", "cancelado", "completado"]).optional(),
    desde: z.coerce.date().optional(),      // "2026-11-01" → Date
    hasta: z.coerce.date().optional(),
    pagina: z.coerce.number().int().min(1).default(1),            // "2" → 2
    porPagina: z.coerce.number().int().min(1).max(50).default(10), // tope para no traer miles
  })
  .refine((q) => !q.desde || !q.hasta || q.desde < q.hasta, {
    error: "'desde' tiene que ser anterior a 'hasta'",
    path: ["desde"],
  });
```

- **`.refine(...)`** → una regla que mira **varios campos a la vez**. `path` indica a qué campo se le asigna el error en `detalles`.

### 6) Índice compuesto

```prisma
model Turno {
  // ...
  @@index([profesionalId, inicio])
}
```

Genera la migración `indice_turnos_profesional_inicio`:

```sql
CREATE INDEX "turnos_profesional_id_inicio_idx" ON "turnos"("profesional_id", "inicio");
```

- Un **índice** es como el índice de un libro: en vez de recorrer toda la tabla, Postgres va directo a las filas que buscás.
- **Compuesto** (dos columnas, en ese orden) → sirve para la consulta más común: "turnos **de este profesional** entre **tal y tal hora**".
- Hace más rápidas las lecturas y un poco más lentas las escrituras (hay que actualizar el índice). En tablas que se consultan mucho, conviene.

### 7) Disponibilidad: `GET /profesionales/:id/disponibilidad?fecha=AAAA-MM-DD&duracion=30`

```ts
export const disponibilidadQuerySchema = z.object({
  fecha: z.iso.date("La fecha tiene que tener formato AAAA-MM-DD"),
  duracion: z.coerce.number().int().min(15).max(240).default(30), // minutos
});
```

El cálculo vive en `turnosService.calcularDisponibilidad`:

1. Verifica que el profesional exista (reusa `profesionalesService.obtener` → `404` si no).
2. Busca **en paralelo** los horarios de atención de ese día de la semana y los turnos ocupados de ese día.
3. Recorre cada horario en bloques de `duracion` minutos.
4. Descarta los bloques que **se pisan** con un turno ocupado o que **ya pasaron**.

```ts
const [horarios, ocupados] = await Promise.all([
  horariosRepository.listarPorDia(profesionalId, inicioDelDia.getDay()),
  turnosRepository.listarOcupados(profesionalId, inicioDelDia, finDelDia),
]);

for (const horario of horarios) {
  const desde = minutosDelDia(horario.inicio); // 09:00 → 540
  const hasta = minutosDelDia(horario.fin);    // 13:00 → 780

  for (let minuto = desde; minuto + duracion <= hasta; minuto += duracion) {
    const inicio = new Date(anio, mes - 1, dia, 0, minuto);
    const fin = new Date(inicio.getTime() + duracion * 60_000);

    const pisaOtroTurno = ocupados.some((t) => t.inicio < fin && inicio < t.fin);
    if (!pisaOtroTurno && inicio > ahora) libres.push({ inicio, fin });
  }
}
```

- **`Promise.all([...])`** → lanza las dos consultas **a la vez** y espera a que terminen las dos. Con dos `await` seguidos, la segunda esperaría a la primera sin necesidad.
- **Minutos desde la medianoche** → trabajar con un número (`540`) es más simple que con horas y minutos por separado. `new Date(anio, mes - 1, dia, 0, 540)` → JavaScript acomoda los 540 minutos como 09:00.
- **`mes - 1`** → en `Date` los meses van de `0` (enero) a `11` (diciembre).
- **`getDay()`** → `0` domingo … `6` sábado: el mismo criterio que la columna `dia_semana`.
- **¿Se pisan dos intervalos?** → `A.inicio < B.fin && B.inicio < A.fin`. Cubre todos los casos (uno adentro del otro, solapados a medias) y permite turnos **pegados** (uno termina 10:00 y el otro empieza 10:00).
- **`listarOcupados`** ignora los turnos `cancelado`: ese horario vuelve a estar libre.
- **`60_000`** → el `_` es solo un separador visual para leer números grandes (`60000`).
- **Horas en UTC:** las columnas `time` se leen con `getUTCHours()` (así las guardó el seed), mientras que el día pedido se arma en **hora local** (Argentina). Por eso un turno de 09:00 sale en el JSON como `12:00:00.000Z`: es la misma hora, escrita en UTC.

Respuestas posibles:

| Caso | Status | `response` |
|------|--------|------------|
| Atiende ese día | `200` | `{ result: true, data: { atiende: true, horarios: [...] } }` y `meta.cantidad` |
| No atiende ese día (ej. domingo) | `200` | `{ result: false, description: "El profesional no atiende ese día", data: { atiende: false, horarios: [] } }` |
| Fecha mal formada | `400` | `error.codigo: "DATOS_INVALIDOS"` |
| Profesional inexistente | `404` | `error.codigo: "NO_ENCONTRADO"` |

### 8) Seed y `requests.http`

- **Seed:** Laura (`1111...`) ahora atiende de **lunes a viernes de 09:00 a 13:00**, generado con un `map` sobre los días en vez de repetir cinco objetos:

```ts
...[1, 2, 3, 4, 5].map((dia) => ({
  profesionalId: "11111111-1111-4111-8111-111111111111",
  diaSemana: dia,
  inicio: hora("09:00"),
  fin: hora("13:00"),
})),
```

- **`requests.http`** suma las secciones **Turnos** (listar, paginar, filtrar, rango invertido, `porPagina` excesivo) y **Disponibilidad** (bloques de 45 minutos, un domingo, fecha mal formada). Las fechas de disponibilidad hay que cambiarlas por un día hábil futuro: los bloques que ya pasaron no se muestran.
- **`sql/consultas.sql`** suma la consulta de horarios de un profesional ordenados por día y hora.

> 🍽️ **Analogía:** el **mozo** ahora entrega todos los platos en la **misma bandeja** (`meta`, `response`, `error`), así el cliente sabe siempre dónde buscar. Y cuando alguien pregunta "¿hay mesa el domingo?", el mozo no rompe nada ni llama al encargado: contesta "no, ese día está cerrado" (`result: false`).

---

## 🤖 Comandos de Claude Code

- `/commit-and-push [mensaje]`: revisa los cambios, crea el commit y hace push a la rama actual.
- `/setup-db`: configura desde cero PostgreSQL (Docker) + Prisma 7 en un proyecto Node/TypeScript: pregunta nombre de la base, usuario, contraseña, contenedor y puerto, y arma `compose.yaml`, `.env`, cliente, seed, scripts y la primera migración.

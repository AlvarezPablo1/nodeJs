# 🗓️ Turnero

Apuntes personales del proceso de aprendizaje de **Node.js**, **Express** y **TypeScript** armando un sistema de turnos, organizados por lecciones.

## 📁 Estructura del proyecto

```
turnero/
├── api/    → backend (Node.js + Express + TypeScript) — ver estructura en la Lección 4
└── web/    → frontend
```

## 📚 Índice

| # | Lección | Tema |
|---|---------|------|
| 1 | [Setup y primer servidor](#-lección-1-setup-y-primer-servidor) | Proyecto Node con TypeScript, Express y primeros endpoints `GET` |
| 2 | [Rutas y CRUD en memoria](#-lección-2--rutas-y-crud-en-memoria) | CRUD de profesionales con `GET`, `POST`, `PUT` y `DELETE` sobre un array en memoria |
| 3 | [Middlewares y validación con Zod](#-lección-3--middlewares-y-validación-con-zod) | Middlewares propios (logger, validación de body/params/query, errores) y validación de datos con Zod |
| 4 | [Arquitectura en capas](#-lección-4--arquitectura-en-capas) | Separar el código en módulos y capas: routes, controller, service, repository; errores personalizados |

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

> **💡 Dato extra:** para agregar un recurso nuevo (ej: turnos) alcanza con copiar la carpeta `modules/profesionales` como `modules/turnos`, adaptar cada capa y montar su router en `app.ts`.

---

## 🤖 Comandos de Claude Code

- `/commit-and-push [mensaje]`: revisa los cambios, crea el commit y hace push a la rama actual.

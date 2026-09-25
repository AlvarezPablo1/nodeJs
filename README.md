# 🗓️ Turnero

Apuntes personales del proceso de aprendizaje de **Node.js**, **Express** y **TypeScript** armando un sistema de turnos, organizados por lecciones.

## 📁 Estructura del proyecto

```
turnero/
├── api/    → backend (Node.js + Express + TypeScript)
└── web/    → frontend
```

## 📚 Índice

| # | Lección | Tema |
|---|---------|------|
| 1 | [Setup y primer servidor](#-lección-1-setup-y-primer-servidor) | Proyecto Node con TypeScript, Express y primeros endpoints `GET` |
| 2 | [Rutas y CRUD en memoria](#-lección-2--rutas-y-crud-en-memoria) | CRUD de profesionales con `GET`, `POST`, `PUT` y `DELETE` sobre un array en memoria |

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

## 🤖 Comandos de Claude Code

- `/commit-and-push [mensaje]`: revisa los cambios, crea el commit y hace push a la rama actual.

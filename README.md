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

## 🤖 Comandos de Claude Code

- `/commit-and-push [mensaje]`: revisa los cambios, crea el commit y hace push a la rama actual.

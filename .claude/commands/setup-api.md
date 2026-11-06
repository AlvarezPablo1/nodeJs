---
name: setup-api
description: Crea desde cero una API REST con Node, Express 5 y TypeScript con arquitectura en capas, validación con Zod, formato de respuesta { meta, response, error }, login con argon2 y JWT, roles y seguridad básica. Usar cuando el usuario pida "/setup-api", "armar una API" o "crear el backend" de un proyecto nuevo. Después de esta skill va /setup-db.
---

# /setup-api · Estructura base de una API

Objetivo: dejar armada la estructura completa de una API con la arquitectura y las convenciones del usuario, lista para que `/setup-db` le conecte la base de datos. Incluye un módulo de autenticación y un módulo de ejemplo que muestra el patrón de cinco capas.

Al terminar esta skill **el proyecto todavía no compila ni arranca**: el login y el módulo de ejemplo usan Prisma, que lo agrega `/setup-db`. Es esperado, y el resumen final se lo explica al usuario.

## Reglas generales

- **Node 20 o superior**, **Express 5**, **Zod 4**, **TypeScript** con módulos ESM (`"type": "module"`, `NodeNext`). Por `NodeNext`, los imports entre archivos propios llevan extensión `.js` aunque el archivo sea `.ts`.
- **Nunca sobrescribir un archivo existente sin preguntar.** Si la carpeta ya tiene un `package.json` con Express, un `src/app.ts` o un `.env`, mostrar lo que hay y preguntar si reemplazar, fusionar o cancelar.
- Nombres de archivos en **camelCase** (convención del usuario); los de cada módulo, como `ejemplos.controller.ts`, `ejemplos.service.ts`, etc.
- Explicar brevemente cada paso mientras se ejecuta; el usuario está aprendiendo y conoce esta arquitectura, así que alcanza con una línea por paso.
- Todo el código va dentro de la carpeta de la API, en `src/`.

### Convenciones que esta skill establece (no cambiarlas)

**Arquitectura en capas**, por módulo:

1. **Rutas** (`.routes.ts`): método, URL y validación de formato (lo que se puede validar mirando solo la request), más autenticación y roles.
2. **Controlador** (`.controller.ts`): lee la request, llama al servicio y envía la respuesta. Nunca tiene lógica de negocio ni `try/catch`.
3. **Servicio** (`.service.ts`): reglas de negocio (las que necesitan datos) y forma de los datos para el front. Nunca ve `req` ni `res`.
4. **Repositorio** (`.repository.ts`): el único que habla con la base. Trae datos y traduce errores de la base a `null`/`false`; no decide nada.
5. **Manejador de errores**: si algo falla en cualquier capa, atrapa el error y envía la respuesta.

**Formato de toda respuesta**: `{ meta, response, error }`.

- `meta`: `endpoint`, `metodo` y `status`, más datos extra cuando hacen falta (por ejemplo `paginacion`).
- `response`: `{ result, data, description? }`. `result: true` si salió bien; `result: false` es un **resultado funcional negativo** (status 200, con `description`). Es `null` si hubo error técnico.
- `error`: `null` si no hubo error técnico; si no, `{ status, description, codigo, detalles? }`.

**Errores técnicos vs. funcionales**:

- **Técnico** → `error`, status 4xx/5xx: datos con formato inválido (400), sin autenticar (401), sin permiso (403), recurso inexistente (404), choque con la base (409), demasiadas solicitudes (429), falla del servidor (500). Se tiran como `AppError` y sus subclases.
- **Funcional** → status 200 con `response.result: false`: la request es válida y se procesó, pero la respuesta de negocio es "no" (por ejemplo, credenciales incorrectas o email ya registrado). Se tira `ReglaDeNegocioError`.
- El DELETE responde **200 con el envoltorio**, nunca 204, para que el front siempre pueda revisar `response`.

## Paso 0 · Relevamiento

1. Verificar la versión de Node con `node -v`. Si es menor a 20, frenar y pedir que la actualicen.
2. Detectar si es un monorepo (por ejemplo, con carpetas `api/` y `web/`) o un proyecto suelto. Si la carpeta de destino no está clara, preguntar.
3. Preguntarle al usuario, en un solo mensaje y proponiendo valores por defecto para que pueda aceptarlos:
   - **Nombre del proyecto** (default: nombre de la carpeta raíz).
   - **Carpeta de la API** (default: `api/` si es un monorepo; la raíz si no).
   - **Puerto** (default: `3000`).
   - **Origen del front** para CORS (default: `http://localhost:5173`, el de Vite).
   - **Roles** (default: `admin` y `usuario`). `/setup-db` va a leer estos roles para crear el enum en la base.

   No avanzar hasta tener la respuesta. En el resto de la skill, `<proyecto>`, `<puerto>` y `<origen-front>` se refieren a estos valores. Si el usuario elige otros roles, reemplazar `"admin", "usuario"` en `lib/jwt.ts` y el rol por defecto del registro en `auth.repository.ts`.

## Paso 1 · package.json y dependencias

Desde la carpeta de la API, si no existe `package.json`, crearlo con `npm init -y`. Después, dejar en `package.json`:

```json
"type": "module",
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "typecheck": "tsc --noEmit"
}
```

Instalar:

```bash
npm install express zod dotenv helmet cors express-rate-limit cookie-parser argon2 jsonwebtoken
npm install -D typescript tsx @types/node @types/express @types/cors @types/cookie-parser @types/jsonwebtoken
```

## Paso 2 · tsconfig.json

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

## Paso 3 · Variables de entorno y .gitignore

Generar un secreto real para los tokens:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Crear `.env` en la carpeta de la API, con el secreto generado:

```
NODE_ENV=development
PORT=<puerto>
JWT_SECRET="<secreto-generado>"
JWT_EXPIRA_EN_SEGUNDOS=28800
CORS_ORIGINS="<origen-front>"
```

Crear `.env.example` con las mismas claves y valores de ejemplo, **nunca** el secreto real:

```
NODE_ENV=development
PORT=3000
JWT_SECRET="generar-con-node-crypto-randomBytes-32"
JWT_EXPIRA_EN_SEGUNDOS=28800
CORS_ORIGINS="http://localhost:5173"
```

La `DATABASE_URL` no va todavía: la agrega `/setup-db`.

Crear o completar el `.gitignore` de la raíz del repo (ajustar las rutas si la API está en una subcarpeta):

```
node_modules
dist
.env
api/src/generated
```

## Paso 4 · Configuración validada

`src/config/env.ts`:

```ts
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.string().min(1, "Falta DATABASE_URL (la agrega /setup-db)"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET tiene que tener al menos 32 caracteres"),
  JWT_EXPIRA_EN_SEGUNDOS: z.coerce.number().int().positive().default(28800),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((valor) => valor.split(",").map((origen) => origen.trim())),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error("Variables de entorno inválidas:");
  for (const issue of resultado.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = resultado.data;
```

## Paso 5 · Errores

`src/errors/appError.ts`:

```ts
// Errores técnicos: se responden en "error" con status 4xx/5xx.
export class AppError extends Error {
  readonly status: number;
  readonly codigo: string;

  constructor(status: number, codigo: string, message: string) {
    super(message);
    this.status = status;
    this.codigo = codigo;
    this.name = "AppError";
  }
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

export class UnauthorizedError extends AppError {
  constructor(mensaje = "Tenés que iniciar sesión") {
    super(401, "NO_AUTENTICADO", mensaje);
  }
}

export class ForbiddenError extends AppError {
  constructor(mensaje = "No tenés permiso para realizar esta acción") {
    super(403, "SIN_PERMISO", mensaje);
  }
}

// Resultado funcional negativo: se responde con 200 y response.result en false.
// No extiende AppError a propósito: no es un error técnico.
export class ReglaDeNegocioError extends Error {
  readonly codigo: string;

  constructor(codigo: string, message: string) {
    super(message);
    this.codigo = codigo;
    this.name = "ReglaDeNegocioError";
  }
}
```

## Paso 6 · Piezas compartidas

`src/shared/respuesta.ts`:

```ts
import type { Response } from "express";

export type Meta = Record<string, unknown>;

export type DetalleError = { campo: string; mensaje: string };

export type ErrorRespuesta = {
  description: string;
  codigo?: string;
  detalles?: DetalleError[];
};

function construirMeta(res: Response, status: number, extra: Meta = {}) {
  return {
    endpoint: res.req.originalUrl.split("?")[0],
    metodo: res.req.method,
    status,
    ...extra,
  };
}

export function responderOk(
  res: Response,
  data: unknown,
  opciones: { status?: number; meta?: Meta } = {},
) {
  const status = opciones.status ?? 200;

  res.status(status).json({
    meta: construirMeta(res, status, opciones.meta),
    response: { result: true, data },
    error: null,
  });
}

export function responderNegativo(
  res: Response,
  description: string,
  data: unknown = null,
  opciones: { meta?: Meta } = {},
) {
  res.status(200).json({
    meta: construirMeta(res, 200, opciones.meta),
    response: { result: false, description, data },
    error: null,
  });
}

export function responderError(res: Response, status: number, error: ErrorRespuesta) {
  res.status(status).json({
    meta: construirMeta(res, status),
    response: null,
    error: { status, ...error },
  });
}
```

`src/shared/schemas.ts`:

```ts
import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.uuid("El ID debe ser un UUID válido"),
});

export type IdParams = z.infer<typeof idParamsSchema>;

export const paginacionSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(50).default(10),
});

export function calcularPaginacion(pagina: number, porPagina: number, total: number) {
  return { pagina, porPagina, total, totalPaginas: Math.ceil(total / porPagina) };
}
```

`src/shared/erroresBaseDeDatos.ts`:

```ts
// Devuelve el código de error de Prisma (por ejemplo "P2002") sin depender del cliente generado.
export function codigoDeErrorPrisma(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String(error.code);
  }
  return undefined;
}
```

## Paso 7 · Contraseñas, tokens y tipos

`src/lib/password.ts`:

```ts
import argon2 from "argon2";

export function hashearPassword(password: string) {
  return argon2.hash(password);
}

export function verificarPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}
```

`src/lib/jwt.ts` (los roles tienen que ser los elegidos en el Paso 0; `/setup-db` los lee de acá):

```ts
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";

export const NOMBRE_COOKIE = "sesion";

export const ROLES = ["admin", "usuario"] as const;

const payloadSchema = z.object({
  sub: z.uuid(),
  rol: z.enum(ROLES),
});

export type UsuarioAutenticado = z.infer<typeof payloadSchema>;

export function firmarToken(usuario: UsuarioAutenticado) {
  return jwt.sign(usuario, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRA_EN_SEGUNDOS });
}

export function verificarToken(token: string): UsuarioAutenticado | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const resultado = payloadSchema.safeParse(payload);
    return resultado.success ? resultado.data : null;
  } catch {
    return null;
  }
}
```

`src/types/express.d.ts`:

```ts
import type { UsuarioAutenticado } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Locals {
      usuario?: UsuarioAutenticado;
    }
  }
}

export {};
```

## Paso 8 · Middlewares

`src/middlewares/logger.ts`:

```ts
import type { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  const inicio = Date.now();

  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - inicio}ms)`);
  });

  next();
}
```

`src/middlewares/validar.ts`:

```ts
import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { responderError } from "../shared/respuesta.js";

type Schemas = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

// Valida params, query y body en ese orden, y corta en la primera parte que falle.
export function validar(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const parte of ["params", "query", "body"] as const) {
      const schema = schemas[parte];
      if (!schema) continue;

      const resultado = schema.safeParse(req[parte]);

      if (!resultado.success) {
        return responderError(res, 400, {
          description: `Datos inválidos en ${parte}`,
          codigo: "DATOS_INVALIDOS",
          detalles: resultado.error.issues.map((issue) => ({
            campo: issue.path.join("."),
            mensaje: issue.message,
          })),
        });
      }

      // El body validado reemplaza al original (sin campos extra); el query va a
      // res.locals porque en Express 5 req.query es de solo lectura.
      if (parte === "body") req.body = resultado.data;
      if (parte === "query") res.locals.query = resultado.data;
    }

    next();
  };
}
```

`src/middlewares/autenticar.ts`:

```ts
import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/appError.js";
import { NOMBRE_COOKIE, verificarToken } from "../lib/jwt.js";

// Busca el token en el header Authorization (apps nativas) o en la cookie (navegador).
export function autenticar(req: Request, res: Response, next: NextFunction) {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.[NOMBRE_COOKIE];

  if (!token) {
    throw new UnauthorizedError();
  }

  const usuario = verificarToken(token);

  if (!usuario) {
    throw new UnauthorizedError("La sesión es inválida o expiró");
  }

  res.locals.usuario = usuario;
  next();
}
```

`src/middlewares/autorizar.ts`:

```ts
import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/appError.js";
import type { UsuarioAutenticado } from "../lib/jwt.js";

// Permisos por rol. Va siempre después de autenticar.
// Los permisos por propiedad ("solo lo suyo") van en el servicio.
export function autorizar(...rolesPermitidos: UsuarioAutenticado["rol"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = res.locals.usuario;

    if (!usuario) {
      throw new UnauthorizedError();
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      throw new ForbiddenError();
    }

    next();
  };
}
```

`src/middlewares/limiteDeSolicitudes.ts`:

```ts
import { rateLimit } from "express-rate-limit";
import { responderError } from "../shared/respuesta.js";

function crearLimite(opciones: { ventanaMinutos: number; maximo: number; mensaje: string }) {
  return rateLimit({
    windowMs: opciones.ventanaMinutos * 60 * 1000,
    limit: opciones.maximo,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => {
      responderError(res, 429, { description: opciones.mensaje, codigo: "DEMASIADAS_SOLICITUDES" });
    },
  });
}

export const limiteGeneral = crearLimite({
  ventanaMinutos: 15,
  maximo: 300,
  mensaje: "Hiciste demasiadas solicitudes. Probá de nuevo en unos minutos.",
});

export const limiteAutenticacion = crearLimite({
  ventanaMinutos: 15,
  maximo: 10,
  mensaje: "Demasiados intentos. Probá de nuevo en 15 minutos.",
});
```

`src/middlewares/rutaNoEncontrada.ts`:

```ts
import type { Request, Response } from "express";
import { responderError } from "../shared/respuesta.js";

export function rutaNoEncontrada(req: Request, res: Response) {
  responderError(res, 404, {
    description: `No existe la ruta ${req.method} ${req.originalUrl}`,
    codigo: "RUTA_NO_ENCONTRADA",
  });
}
```

`src/middlewares/manejadorDeErrores.ts`:

```ts
import type { ErrorRequestHandler } from "express";
import { AppError, ReglaDeNegocioError } from "../errors/appError.js";
import { codigoDeErrorPrisma } from "../shared/erroresBaseDeDatos.js";
import { responderError, responderNegativo } from "../shared/respuesta.js";

export const manejadorDeErrores: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ReglaDeNegocioError) {
    return responderNegativo(res, err.message, { codigo: err.codigo });
  }

  if (err instanceof AppError) {
    return responderError(res, err.status, { description: err.message, codigo: err.codigo });
  }

  if (err.type === "entity.parse.failed") {
    return responderError(res, 400, { description: "El body no es un JSON válido", codigo: "JSON_INVALIDO" });
  }

  if (err.type === "entity.too.large") {
    return responderError(res, 413, {
      description: "El cuerpo de la solicitud es demasiado grande",
      codigo: "PAYLOAD_DEMASIADO_GRANDE",
    });
  }

  const codigoPrisma = codigoDeErrorPrisma(err);

  if (codigoPrisma === "P2002") {
    return responderError(res, 409, { description: "Ya existe un registro con ese valor", codigo: "CONFLICTO" });
  }

  if (codigoPrisma === "P2003") {
    return responderError(res, 409, {
      description: "La operación choca con datos relacionados",
      codigo: "CONFLICTO",
    });
  }

  console.error(err);
  responderError(res, 500, { description: "Error interno del servidor", codigo: "ERROR_INTERNO" });
};
```

## Paso 9 · Módulos

### Salud

`src/modules/salud/salud.routes.ts`:

```ts
import { Router } from "express";
import { responderOk } from "../../shared/respuesta.js";

export const saludRouter = Router();

saludRouter.get("/", (req, res) => {
  responderOk(res, { estado: "ok", fecha: new Date().toISOString() });
});
```

No tiene servicio ni repositorio porque no consulta datos.

### Autenticación

`src/modules/auth/auth.schema.ts`:

```ts
import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("El email no es válido"));

export const registroSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

`src/modules/auth/auth.repository.ts`:

```ts
import { prisma } from "../../lib/prisma.js";
import { codigoDeErrorPrisma } from "../../shared/erroresBaseDeDatos.js";

// Nunca incluye passwordHash: es lo único que se devuelve hacia afuera.
const usuarioPublico = {
  id: true,
  email: true,
  rol: true,
  creadoEn: true,
} as const;

export const authRepository = {
  // El único método que trae el hash, y solo para verificar el login.
  buscarPorEmailConPassword(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  buscarPorId(id: string) {
    return prisma.usuario.findUnique({ where: { id }, select: usuarioPublico });
  },

  async crear(datos: { email: string; passwordHash: string }) {
    try {
      return await prisma.usuario.create({
        data: { email: datos.email, passwordHash: datos.passwordHash, rol: "usuario" },
        select: usuarioPublico,
      });
    } catch (error) {
      if (codigoDeErrorPrisma(error) === "P2002") return null;
      throw error;
    }
  },
};
```

`src/modules/auth/auth.service.ts`:

```ts
import { ReglaDeNegocioError, UnauthorizedError } from "../../errors/appError.js";
import { firmarToken } from "../../lib/jwt.js";
import { hashearPassword, verificarPassword } from "../../lib/password.js";
import { authRepository } from "./auth.repository.js";
import type { LoginInput, RegistroInput } from "./auth.schema.js";

// Hash de una contraseña que no pertenece a nadie. Hace que el login tarde lo mismo
// exista o no el usuario, para no revelar qué emails tienen cuenta (ataque de tiempo).
const hashFalso = hashearPassword("contraseña-que-no-pertenece-a-nadie");

export const authService = {
  async registrar(datos: RegistroInput) {
    const passwordHash = await hashearPassword(datos.password);
    const usuario = await authRepository.crear({ email: datos.email, passwordHash });

    if (!usuario) {
      throw new ReglaDeNegocioError("EMAIL_EN_USO", "Ya existe una cuenta con ese email");
    }

    return usuario;
  },

  async login(datos: LoginInput) {
    const usuario = await authRepository.buscarPorEmailConPassword(datos.email);
    const hashAComparar = usuario?.passwordHash ?? (await hashFalso);
    const passwordValida = await verificarPassword(hashAComparar, datos.password);

    // Mismo mensaje para email inexistente y contraseña incorrecta.
    if (!usuario || !passwordValida) {
      throw new ReglaDeNegocioError("CREDENCIALES_INVALIDAS", "Email o contraseña incorrectos");
    }

    const token = firmarToken({ sub: usuario.id, rol: usuario.rol });

    return { token, usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol } };
  },

  async obtenerActual(usuarioId: string) {
    const usuario = await authRepository.buscarPorId(usuarioId);
    if (!usuario) throw new UnauthorizedError("La cuenta ya no existe");
    return usuario;
  },
};
```

`src/modules/auth/auth.controller.ts`:

```ts
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { NOMBRE_COOKIE } from "../../lib/jwt.js";
import { responderOk } from "../../shared/respuesta.js";
import { authService } from "./auth.service.js";

const opcionesCookie = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: env.JWT_EXPIRA_EN_SEGUNDOS * 1000,
};

export const authController = {
  async registrar(req: Request, res: Response) {
    responderOk(res, await authService.registrar(req.body), { status: 201 });
  },

  // El token va en la cookie (navegador) y en data (apps nativas).
  async login(req: Request, res: Response) {
    const { token, usuario } = await authService.login(req.body);
    res.cookie(NOMBRE_COOKIE, token, opcionesCookie);
    responderOk(res, { token, usuario });
  },

  logout(req: Request, res: Response) {
    res.clearCookie(NOMBRE_COOKIE, { ...opcionesCookie, maxAge: undefined });
    responderOk(res, null);
  },

  async yo(req: Request, res: Response) {
    responderOk(res, await authService.obtenerActual(res.locals.usuario!.sub));
  },
};
```

`src/modules/auth/auth.routes.ts`:

```ts
import { Router } from "express";
import { autenticar } from "../../middlewares/autenticar.js";
import { limiteAutenticacion } from "../../middlewares/limiteDeSolicitudes.js";
import { validar } from "../../middlewares/validar.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registroSchema } from "./auth.schema.js";

export const authRouter = Router();

authRouter.post("/registro", limiteAutenticacion, validar({ body: registroSchema }), authController.registrar);
authRouter.post("/login", limiteAutenticacion, validar({ body: loginSchema }), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/yo", autenticar, authController.yo);
```

### Ejemplos (módulo de referencia con las cinco capas)

Usa el modelo `Ejemplo` que crea `/setup-db`. Sirve como plantilla para copiar al crear los módulos reales.

`src/modules/ejemplos/ejemplos.schema.ts`:

```ts
import { z } from "zod";
import { paginacionSchema } from "../../shared/schemas.js";

export const ejemploSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().trim().optional(),
  activo: z.boolean().optional(),
});

export const listarEjemplosQuerySchema = paginacionSchema.extend({
  activo: z
    .enum(["true", "false"])
    .transform((valor) => valor === "true")
    .optional(),
});

export type EjemploInput = z.infer<typeof ejemploSchema>;
export type ListarEjemplosQuery = z.infer<typeof listarEjemplosQuerySchema>;
```

`src/modules/ejemplos/ejemplos.repository.ts`:

```ts
import { prisma } from "../../lib/prisma.js";
import { codigoDeErrorPrisma } from "../../shared/erroresBaseDeDatos.js";
import type { EjemploInput } from "./ejemplos.schema.js";

export const ejemplosRepository = {
  listar(filtro: { activo?: boolean }, pagina: number, porPagina: number) {
    const where = { activo: filtro.activo };

    return prisma.$transaction([
      prisma.ejemplo.findMany({
        where,
        orderBy: { creadoEn: "desc" },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.ejemplo.count({ where }),
    ]);
  },

  buscarPorId(id: string) {
    return prisma.ejemplo.findUnique({ where: { id } });
  },

  crear(datos: EjemploInput) {
    return prisma.ejemplo.create({ data: datos });
  },

  async actualizar(id: string, datos: EjemploInput) {
    try {
      return await prisma.ejemplo.update({ where: { id }, data: datos });
    } catch (error) {
      if (codigoDeErrorPrisma(error) === "P2025") return null;
      throw error;
    }
  },

  async eliminar(id: string) {
    try {
      await prisma.ejemplo.delete({ where: { id } });
      return true;
    } catch (error) {
      if (codigoDeErrorPrisma(error) === "P2025") return false;
      throw error;
    }
  },
};
```

`src/modules/ejemplos/ejemplos.service.ts`:

```ts
import { NotFoundError } from "../../errors/appError.js";
import { calcularPaginacion } from "../../shared/schemas.js";
import { ejemplosRepository } from "./ejemplos.repository.js";
import type { EjemploInput, ListarEjemplosQuery } from "./ejemplos.schema.js";

export const ejemplosService = {
  async listar(query: ListarEjemplosQuery) {
    const { pagina, porPagina, ...filtro } = query;
    const [ejemplos, total] = await ejemplosRepository.listar(filtro, pagina, porPagina);
    return { ejemplos, paginacion: calcularPaginacion(pagina, porPagina, total) };
  },

  async obtener(id: string) {
    const ejemplo = await ejemplosRepository.buscarPorId(id);
    if (!ejemplo) throw new NotFoundError("Ejemplo");
    return ejemplo;
  },

  crear(datos: EjemploInput) {
    return ejemplosRepository.crear(datos);
  },

  async actualizar(id: string, datos: EjemploInput) {
    const actualizado = await ejemplosRepository.actualizar(id, datos);
    if (!actualizado) throw new NotFoundError("Ejemplo");
    return actualizado;
  },

  async eliminar(id: string) {
    const eliminado = await ejemplosRepository.eliminar(id);
    if (!eliminado) throw new NotFoundError("Ejemplo");
  },
};
```

`src/modules/ejemplos/ejemplos.controller.ts`:

```ts
import type { Request, Response } from "express";
import { responderOk } from "../../shared/respuesta.js";
import type { IdParams } from "../../shared/schemas.js";
import { ejemplosService } from "./ejemplos.service.js";
import type { ListarEjemplosQuery } from "./ejemplos.schema.js";

export const ejemplosController = {
  async listar(req: Request, res: Response) {
    const { ejemplos, paginacion } = await ejemplosService.listar(res.locals.query as ListarEjemplosQuery);
    responderOk(res, ejemplos, { meta: { paginacion } });
  },

  async obtener(req: Request<IdParams>, res: Response) {
    responderOk(res, await ejemplosService.obtener(req.params.id));
  },

  async crear(req: Request, res: Response) {
    responderOk(res, await ejemplosService.crear(req.body), { status: 201 });
  },

  async actualizar(req: Request<IdParams>, res: Response) {
    responderOk(res, await ejemplosService.actualizar(req.params.id, req.body));
  },

  async eliminar(req: Request<IdParams>, res: Response) {
    await ejemplosService.eliminar(req.params.id);
    responderOk(res, null);
  },
};
```

`src/modules/ejemplos/ejemplos.routes.ts`:

```ts
import { Router } from "express";
import { autenticar } from "../../middlewares/autenticar.js";
import { autorizar } from "../../middlewares/autorizar.js";
import { validar } from "../../middlewares/validar.js";
import { idParamsSchema } from "../../shared/schemas.js";
import { ejemplosController } from "./ejemplos.controller.js";
import { ejemploSchema, listarEjemplosQuerySchema } from "./ejemplos.schema.js";

export const ejemplosRouter = Router();

// Lectura pública; escritura solo para admin.
ejemplosRouter.get("/", validar({ query: listarEjemplosQuerySchema }), ejemplosController.listar);
ejemplosRouter.get("/:id", validar({ params: idParamsSchema }), ejemplosController.obtener);
ejemplosRouter.post("/", autenticar, autorizar("admin"), validar({ body: ejemploSchema }), ejemplosController.crear);
ejemplosRouter.put(
  "/:id",
  autenticar,
  autorizar("admin"),
  validar({ params: idParamsSchema, body: ejemploSchema }),
  ejemplosController.actualizar,
);
ejemplosRouter.delete(
  "/:id",
  autenticar,
  autorizar("admin"),
  validar({ params: idParamsSchema }),
  ejemplosController.eliminar,
);
```

## Paso 10 · App y servidor

`src/app.ts`:

```ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { limiteGeneral } from "./middlewares/limiteDeSolicitudes.js";
import { logger } from "./middlewares/logger.js";
import { manejadorDeErrores } from "./middlewares/manejadorDeErrores.js";
import { rutaNoEncontrada } from "./middlewares/rutaNoEncontrada.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { ejemplosRouter } from "./modules/ejemplos/ejemplos.routes.js";
import { saludRouter } from "./modules/salud/salud.routes.js";

export const app = express();

// En producción, detrás del proxy del hosting, descomentar para que el rate limit vea la IP real:
// app.set("trust proxy", 1);

// Orden: lo más barato y lo que rechaza antes, primero.
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(limiteGeneral);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(logger);

app.use("/api/v1/salud", saludRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/ejemplos", ejemplosRouter);

app.use(rutaNoEncontrada);
app.use(manejadorDeErrores);
```

`src/server.ts`:

```ts
import { env } from "./config/env.js";
import { app } from "./app.js";

// Sirve únicamente para levantar el servidor. Para testear, se importa app.ts directamente.

app.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});
```

## Paso 11 · requests.http

Crear `requests.http` en la carpeta de la API (para la extensión REST Client):

```http
@baseUrl = http://localhost:<puerto>/api/v1

# Credenciales del admin: las define el seed de /setup-db.
@adminEmail = REEMPLAZAR-con-el-email-del-seed
@adminPassword = REEMPLAZAR-con-la-contraseña-del-seed

# =========================================================
# ===== Salud
# =========================================================

### Salud de la API
GET {{baseUrl}}/salud

# =========================================================
# ===== Autenticación
# =========================================================

### Login admin
# @name loginAdmin
POST {{baseUrl}}/auth/login
Content-Type: application/json

{ "email": "{{adminEmail}}", "password": "{{adminPassword}}" }

@tokenAdmin = {{loginAdmin.response.body.response.data.token}}

### Quién soy
GET {{baseUrl}}/auth/yo
Authorization: Bearer {{tokenAdmin}}

### Registro → 201
POST {{baseUrl}}/auth/registro
Content-Type: application/json

{ "email": "nuevo@mail.com", "password": "unaClaveSegura123" }

### Login con contraseña incorrecta → 200, result false, CREDENCIALES_INVALIDAS
POST {{baseUrl}}/auth/login
Content-Type: application/json

{ "email": "{{adminEmail}}", "password": "incorrecta" }

### Logout
POST {{baseUrl}}/auth/logout

### Quién soy sin token (después del logout) → 401
GET {{baseUrl}}/auth/yo

# =========================================================
# ===== Ejemplos
# =========================================================

### Listar (público, paginado)
GET {{baseUrl}}/ejemplos?pagina=1&porPagina=10

### Crear (admin) → 201
# @name crearEjemplo
POST {{baseUrl}}/ejemplos
Authorization: Bearer {{tokenAdmin}}
Content-Type: application/json

{ "nombre": "Ejemplo nuevo", "descripcion": "Creado desde requests.http" }

### Ver el recién creado
GET {{baseUrl}}/ejemplos/{{crearEjemplo.response.body.response.data.id}}

### Eliminar el recién creado → 200 con el envoltorio
DELETE {{baseUrl}}/ejemplos/{{crearEjemplo.response.body.response.data.id}}
Authorization: Bearer {{tokenAdmin}}

### Crear sin token → 401
POST {{baseUrl}}/ejemplos
Content-Type: application/json

{ "nombre": "Sin permiso" }

### Id mal formado → 400
GET {{baseUrl}}/ejemplos/hola

### Ruta inexistente → 404
GET {{baseUrl}}/no-existe
```

## Paso 12 · README

Agregar al `README.md` del proyecto (crearlo si no existe) una sección **Arquitectura** con:

- El recorrido de una request: rutas (formato) → controlador (lee la request) → servicio (reglas de negocio) → repositorio (base) → servicio (forma los datos) → controlador (responde) → manejador de errores (si algo falla).
- El formato `{ meta, response, error }` con un ejemplo de éxito, uno de resultado funcional negativo y uno de error técnico.
- La regla de errores técnicos vs. funcionales.
- Cómo crear un módulo nuevo: copiar `modules/ejemplos/`, renombrar, ajustar el schema de Zod y el modelo de Prisma, y montar el router en `app.ts`.

## Paso 13 · Verificación

Correr `npx tsc --noEmit`. En este punto **es esperado que falle**, pero solo por una razón: `src/lib/prisma.ts` todavía no existe (y con él, el modelo de Prisma). Verificar que **todos** los errores sean de ese tipo (`Cannot find module '../../lib/prisma.js'` o equivalentes en `auth.repository.ts` y `ejemplos.repository.ts`). Cualquier otro error es un problema real de esta skill: corregirlo antes de terminar.

No intentar levantar la API todavía: `config/env.ts` va a frenar el arranque por la falta de `DATABASE_URL`, que es justamente lo que agrega `/setup-db`.

## Paso 14 · Resumen final para el usuario

Terminar con un mensaje que tenga estas tres partes.

### 1. Qué se creó

Lista corta de la estructura, por carpeta: `config/`, `errors/`, `lib/`, `middlewares/`, `modules/` (salud, auth, ejemplos), `shared/`, `types/`, más `app.ts`, `server.ts`, `requests.http`, `.env`, `.env.example` y `tsconfig.json`.

### 2. El próximo paso: `/setup-db`

Decirlo explícitamente:

> La API todavía no compila ni arranca: el login y el módulo de ejemplo necesitan la base de datos. **Ahora corré `/setup-db`**, que agrega Postgres, Prisma, el modelo `Usuario` con estos roles (`<roles elegidos>`), el modelo `Ejemplo` y un usuario admin.

### 3. Datos que hay que reemplazar por los reales

| Dónde | Qué | Valor actual | Cuándo cambiarlo |
|---|---|---|---|
| `.env` | `JWT_SECRET` | secreto generado para desarrollo | En producción, generar **otro** y configurarlo en el panel del hosting. Nunca reutilizar el de desarrollo. |
| `.env` | `CORS_ORIGINS` | `<origen-front>` | En producción, el dominio real del front (pueden ser varios, separados por coma). |
| `.env` | `JWT_EXPIRA_EN_SEGUNDOS` | `28800` (8 horas) | Si el proyecto necesita sesiones más cortas o más largas. |
| `src/lib/jwt.ts` | `NOMBRE_COOKIE` | `sesion` | Opcional: un nombre propio del proyecto. |
| `src/app.ts` | `trust proxy` | comentado | Al hacer el deploy detrás del proxy del hosting, descomentarlo. |
| `requests.http` | `@adminEmail` y `@adminPassword` | `REEMPLAZAR...` | Después de `/setup-db`, con las credenciales que muestre su resumen. |
| `src/modules/ejemplos/` | Módulo de ejemplo | genérico | Usarlo como plantilla para los módulos reales y después borrarlo (junto con su router en `app.ts` y el modelo en `/setup-db`). |

Recordatorio final: el `.env` no va a Git; el `.env.example` sí.

import express from "express";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";

//CREACION DE LA APP
const app = express();
//DESHABILITAR EL HEADER X-POWERED-BY
app.disable('x-powered-by');
//MIDDLEWARE PARA PARSEAR JSON
app.use(express.json());


//MIDDLEWARE PARA LOGUEAR LAS PETICIONES
app.use((req, res, next) => {
  const inicio = Date.now();

  res.on("finish", () => {
    const duracion = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} X-response-time: ${duracion}ms`);
  });

  next();
});

//PUERTO DE ESCUCHA
const PORT = 3000;

//SCHEMAS DE VALIDACION
const greetingQuerySchema = z.object({
  //".ENUM" OBLIGA QUE UNICAMENTE RECIBA, EN ESTE CASO, "TRUE" O "FALSE", Y EL ".OPTIONAL" HACE QUE SEA OPCIONAL, SI NO SE ENVIA NADA, NO DA ERROR.
  formal: z.enum(["true", "false"]).optional().transform((val) => val === "true"),
});

const idSchema = z.object({
  id: z.uuid("El ID debe ser un UUID válido"),
});

const profesionalSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  especialidad: z.string().trim().min(2, "La especialidad es obligatoria"),
  email: z.email("El email no es válido"),
});

type ProfesionalInput = z.infer<typeof profesionalSchema>;
type Profesional = ProfesionalInput & { id: string };

let profesionales: Profesional[] = [
  { id: randomUUID(), nombre: "Laura Gómez", especialidad: "Kinesiología", email: "laura@turnero.com" },
  { id: randomUUID(), nombre: "Martín Ruiz", especialidad: "Nutrición", email: "martin@turnero.com" },
];

//MIDDLEWARES DE VALIDACION
function validarParams(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.params);
    
    if (!resultado.success) {
      return res.status(400).json({
        error: "Parámetros inválidos",
        detalles: resultado.error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensaje: issue.message,
        })),
      });
    }

    next();
  }
}

function validarQuery(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.query);

    if (!resultado.success) {
      return res.status(400).json({
        error: "Query inválido",
        detalles: resultado.error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensaje: issue.message,
        })),
      });
    }
    // "RES.LOCALS" ES UN OBJETO QUE SE UTILIZA PARA ALMACENAR DATOS QUE SE PUEDEN PASAR ENTRE MIDDLEWARES Y RUTAS. 
    // EN ESTE CASO, SE ESTÁ ALMACENANDO EL RESULTADO DE LA VALIDACIÓN DEL QUERY EN "RES.LOCALS.QUERY", PARA QUE PUEDA SER ACCEDIDO MÁS ADELANTE EN EL FLUJO DE LA PETICIÓN.
    res.locals.query = resultado.data;
    next();
  };
}

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

const manejadorDeErrores: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
};


//ENDPOINTS
const healthEndpoint = "api/v1/health";
const infoEndpoint = "api/v1/info";
const greetingEndpoint = "api/v1/greeting/:name";
const profesionalesEndpoint = "api/v1/profesionales";


//GET
app.get(`/${healthEndpoint}`, (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get(`/${infoEndpoint}`, (req, res) => {
  res.status(200).json({
    projectName: "learn nodejs",
    version: "1.0.0",
  });
});

app.get(`/${greetingEndpoint}`, validarQuery(greetingQuerySchema), (req, res) => {
  const { name } = req.params;
  const { formal } = res.locals.query as z.infer<typeof greetingQuerySchema>;

  const message = formal ? `Good day, ${name}.` : `Hello, ${name}!`;
  res.status(200).json({ message });
});

app.get(`/${profesionalesEndpoint}/:id`, validarParams(idSchema), (req, res) => {
    const { id } = req.params;
    const profesional = profesionales.find((p) => p.id === id);

    if (profesional) {
        res.status(200).json(profesional);
    } else {
        res.status(404).json({ error: "Profesional no encontrado" });
    }
});

app.get(`/${profesionalesEndpoint}`, (req, res) => {
    const especialidad = req.query.especialidad;
    const profesionalesFiltrados = profesionales.filter((p) => p.especialidad === especialidad);

    if (especialidad) {
        res.status(200).json(profesionalesFiltrados);
    } else {
        res.status(200).json(profesionales); // Devuelve todos los profesionales si no se encuentra ninguno con la especialidad especificada
    }
});

//POST

app.post(`/${profesionalesEndpoint}`, validarBody(profesionalSchema), (req, res) => {
  const nuevo: Profesional = { id: randomUUID(), ...req.body };
  profesionales.push(nuevo);
  res.status(201).json(nuevo);
});

//PUT

app.put(`/${profesionalesEndpoint}/:id`, validarParams(idSchema), validarBody(profesionalSchema), (req, res) => {
  const { id } = req.params;
  //UTILIZAMOS EL FINDINDEX PARA OBTENER EL INDICE DEL PROFESIONAL A ACTUALIZAR.
  //EL FIND NOS DEVUELVE EL OBJETO, EL FINDINDEX NOS DEVUELVE EL INDICE DEL OBJETO EN EL ARRAY, 
  //SI NO LO ENCUENTRA DEVUELVE -1
  const profesionalIndex = profesionales.findIndex((p) => p.id === id);

  if (profesionalIndex === -1) {
    return res.status(404).json({ error: "Profesional no encontrado" });
  }

  profesionales[profesionalIndex] = { id, ...req.body };
  res.status(200).json(profesionales[profesionalIndex]);
});

//DELETE

app.delete(`/${profesionalesEndpoint}/:id`, validarParams(idSchema), (req, res) => {
    const { id } = req.params;
    const profesionalIndex = profesionales.findIndex((p) => p.id === id);

    if (profesionalIndex === -1) {
        return res.status(404).json({ error: "Profesional no encontrado" });
    }

    profesionales.splice(profesionalIndex, 1);
    res.status(204).send();
});

//SI NO RESUELVE NINGUN ENDPOINT, DEVUELVE UN ERROR 404
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    ruta: `${req.method} ${req.originalUrl}`,
  });
});

//MIDDLEWARE DE MANEJO DE ERRORES (500)
app.use(manejadorDeErrores);


//INICIAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
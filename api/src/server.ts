import express from "express";
import { randomUUID } from "node:crypto";

//CREACION DE LA APP
const app = express();
//MIDDLEWARE PARA PARSEAR JSON
app.use(express.json());
//PUERTO DE ESCUCHA
const PORT = 3000;

//TIPOS
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

app.get(`/${greetingEndpoint}`, (req, res) => {
    const {name} = req.params;
    const isFormal = req.query.formal === 'true';
    const message = isFormal ? `Good day, ${name}.` : `Hello, ${name}!`;
  res.status(200).json({
    message: message,
  });
});

app.get(`/${profesionalesEndpoint}`, (req, res) => {
  res.status(200).json(profesionales);
});

app.get(`/${profesionalesEndpoint}/:id`, (req, res) => {
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

app.post("/api/v1/profesionales", (req, res) => {
  const { nombre, especialidad, email } = req.body;

  if (!nombre || !especialidad || !email) {
    return res.status(400).json({ error: "nombre, especialidad y email son obligatorios" });
  }

  const nuevo: Profesional = { id: randomUUID(), nombre, especialidad, email };
  profesionales.push(nuevo);

  res.status(201).json(nuevo);
});

//PUT

app.put(`/${profesionalesEndpoint}/:id`, (req, res) => {
    const { id } = req.params;
    const { nombre, especialidad, email } = req.body;

    //UTILIZAMOS EL FINDINDEX PARA OBTENER EL INDICE DEL PROFESIONAL A ACTUALIZAR.
    //EL FIND NOS DEVUELVE EL OBJETO, EL FINDINDEX NOS DEVUELVE EL INDICE DEL OBJETO EN EL ARRAY, 
    //SI NO LO ENCUENTRA DEVUELVE -1
    const profesionalIndex = profesionales.findIndex((p) => p.id === id);

    if (profesionalIndex === -1) {
        return res.status(404).json({ error: "Profesional no encontrado" });
    }

    if (!nombre || !especialidad || !email) {
        return res.status(400).json({ error: "nombre, especialidad y email son obligatorios" });
    }

    profesionales[profesionalIndex] = { id, nombre, especialidad, email };
    res.status(200).json(profesionales[profesionalIndex]);
});

//DELETE

app.delete(`/${profesionalesEndpoint}/:id`, (req, res) => {
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


//INICIAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}/${infoEndpoint}`);
});
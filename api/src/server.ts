import express from "express";

//CREACION DE LA APP
const app = express();
//PUERTO DE ESCUCHA
const PORT = 3000;
//ENDPOINTS
const healthEndpoint = "api/v1/health";
const infoEndpoint = "api/v1/info";
const greetingEndpoint = "api/v1/greeting/:name";

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

//INICIAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}/${infoEndpoint}`);
});
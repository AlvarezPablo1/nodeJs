import { app } from "./app.js";

//Sirve unicamete para levantar el servidor de la API, no para testearla. Para testearla se debe usar el archivo app.ts

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
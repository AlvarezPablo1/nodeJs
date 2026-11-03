import { env } from "./config/env.js";
import { app } from "./app.js";

// Sirve únicamente para levantar el servidor de la API. Para testearla, se importa app.ts directamente.

app.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});
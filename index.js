import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Importar y usar las rutas de login
import loginRoutes from "./src/routes/login.routes.js"; // Ruta corregida
app.use("/api/login", loginRoutes);

app.get("/", (req, res) => {
  res.send("Servidor activo con watch ✅");
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000 🚀");
});
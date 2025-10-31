import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import logsRoutes from "./src/routes/logs.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/logs", logsRoutes);

app.get("/", (req, res) => {
  res.send("Servidor activo con watch ✅");
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000 🚀");
});

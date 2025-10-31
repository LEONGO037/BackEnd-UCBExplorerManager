import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor activo con watch ✅");
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000 🚀");
});

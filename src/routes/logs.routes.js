import express from "express";
import { LogsController } from "../controllers/logs.controller.js";

const router = express.Router();

// Obtener todos los logs
router.get("/", LogsController.getAll);

// Obtener logs por usuario
router.get("/usuario/:id_usuario", LogsController.getByUser);

// Crear un nuevo log
router.post("/", LogsController.create);

export default router;

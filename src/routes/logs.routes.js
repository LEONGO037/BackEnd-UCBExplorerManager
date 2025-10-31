import express from "express";
import { LogsController } from "../controllers/logs.controller.js";

const router = express.Router();

// Obtener todos los logs
router.get("/", LogsController.getAll);

// Obtener logs por usuario
router.get("/usuario/:id_usuario", LogsController.getByUser);

// Crear un nuevo log
router.post("/", LogsController.create);

// Crear un log para todos los usuarios (bulk)
router.post("/bulk", LogsController.createForAll);

export default router;

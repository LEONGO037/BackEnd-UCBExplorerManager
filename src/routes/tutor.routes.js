import express from 'express';
import { tutorController } from '../controllers/tutor.controller.js';


const router = express.Router();


// Obtener todos los estudiantes asignados al tutor con sus progresos
router.get('/estudiantes/:id_tutor', tutorController.obtenerEstudiantes);

export default router;
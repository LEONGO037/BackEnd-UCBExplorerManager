import { Router } from 'express';
import { EstudiantesController } from '../controllers/estudiantes.controller.js';

const router = Router();

// Filters (before '/:id')
router.get('/colegio/:id_colegio', EstudiantesController.byColegio);

router.get('/', EstudiantesController.list);
router.get('/:id', EstudiantesController.get);
router.post('/', EstudiantesController.create);
router.put('/:id', EstudiantesController.update);
router.delete('/:id', EstudiantesController.remove);

export default router;

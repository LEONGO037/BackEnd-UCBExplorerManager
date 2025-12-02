import { Router } from 'express';
import { VisitsController } from '../controllers/visits.controller.js';

const router = Router();

// Filters (place before '/:id' to avoid route collision)
router.get('/colegio/:id_colegio', VisitsController.byColegio);
router.get('/guia/:id_guia', VisitsController.byGuia);

router.get('/', VisitsController.list);
router.get('/:id', VisitsController.get);
router.post('/', VisitsController.create);
router.put('/:id', VisitsController.update);
router.delete('/:id', VisitsController.remove);

export default router;


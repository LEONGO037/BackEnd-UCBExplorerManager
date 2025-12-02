import { Router } from 'express';
import { ColegiosController } from '../controllers/colegios.controller.js';

const router = Router();

router.get('/', ColegiosController.list);
router.get('/simple', ColegiosController.simpleList);
router.get('/:id', ColegiosController.get);
router.post('/', ColegiosController.create);
router.put('/:id', ColegiosController.update);
router.delete('/:id', ColegiosController.remove);

export default router;

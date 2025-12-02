import { Router } from 'express';
import { GuiasController } from '../controllers/guias.controller.js';

const router = Router();

router.get('/', GuiasController.list);
router.get('/simple', GuiasController.simpleList);
router.get('/:id', GuiasController.get);
router.post('/', GuiasController.create);
router.put('/:id', GuiasController.update);
router.delete('/:id', GuiasController.remove);

export default router;

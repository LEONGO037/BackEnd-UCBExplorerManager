import { Router } from 'express';
import { RegisterController } from '../controllers/register.controller.js';

const router = Router();

router.post('/register', RegisterController.register);
router.post('/change-password', RegisterController.changePassword);

export default router;
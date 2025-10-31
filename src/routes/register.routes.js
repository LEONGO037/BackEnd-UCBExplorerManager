import { Router } from 'express';
import { RegisterController } from '../controllers/register.controller.js';

const router = Router();

router.post('/register', RegisterController.register);
router.post('/change-password', RegisterController.changePassword);
router.get('/has-logged-before', RegisterController.hasLoggedInBefore);

export default router;
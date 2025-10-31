import { Router } from 'express';
import { RegisterController } from '../controllers/register.controller.js';

const router = Router();

router.post('/register', RegisterController.register);
router.post('/change-password', RegisterController.changePassword);
router.get('/has-logged-before', RegisterController.hasLoggedInBefore);
router.post('/verify-email', RegisterController.verifyEmail);
router.post('/verify-code', RegisterController.verifyCode);
router.post('/update-password', RegisterController.updatePasswordByEmail);


export default router;
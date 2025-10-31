import express from 'express';
import { LoginController } from '../controllers/login.controller.js';
import { verificarToken } from '../middleware/tokens.js';

const router = express.Router();

// Ruta para solicitar login (Paso 1)
router.post('/solicitar', LoginController.solicitarLogin);

// Ruta para verificar código (Paso 2)
router.post('/verificar', LoginController.verificarCodigo);

// Ruta para verificar token (protegida)
router.get('/verificar-token', verificarToken, LoginController.verificarToken);

export default router;
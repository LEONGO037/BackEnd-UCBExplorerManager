import { LoginModel } from '../models/login.model.js';
import { sendEmail } from '../middleware/sendEmail.js';
import { generarToken, verificarToken } from '../middleware/tokens.js';
import bcrypt from 'bcrypt';

const LoginController = {
  // Paso 1: Solicitar inicio de sesión y enviar código
  async solicitarLogin(req, res) {
    try {
      const { correo, contrasenia } = req.body;

      console.log('Datos recibidos:', req.body);

      if (!correo || !contrasenia) {
        return res.status(400).json({
          success: false,
          message: 'Correo y contraseña son requeridos'
        });
      }

      // Buscar usuario
      const usuario = await LoginModel.findByEmail(correo);
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      console.log('Usuario encontrado:', usuario);

      // Verificar contraseña
      const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
      
      if (!contraseniaValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar código de verificación
      const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar código en la base de datos
      await LoginModel.saveVerificationCode(usuario.id_usuario, codigoVerificacion);

      // Enviar código por correo
      await sendEmail({
        to: correo,
        subject: 'Código de verificación - Sistema de Gestión',
        text: `Tu código de verificación es: ${codigoVerificacion}\n\nEste código expirará en 10 minutos.`
      });

      res.json({
        success: true,
        message: 'Código de verificación enviado al correo',
        id_usuario: usuario.id_usuario,
        requiereVerificacion: true
      });

    } catch (error) {
      console.error('Error en solicitarLogin:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Paso 2: Verificar código y generar token
  async verificarCodigo(req, res) {
    try {
      const { id_usuario, codigo } = req.body;

      if (!id_usuario || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario y código son requeridos'
        });
      }

      // Validar código
      const codigoValido = await LoginModel.validateVerificationCode(id_usuario, codigo);
      
      if (!codigoValido) {
        return res.status(401).json({
          success: false,
          message: 'Código inválido o expirado'
        });
      }

      // Obtener datos completos del usuario
      const usuario = await LoginModel.findByUserId(id_usuario);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Generar token JWT
      const token = generarToken({
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        id_rol: usuario.id_rol
      });

      res.json({
        success: true,
        message: 'Login exitoso',
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        }
      });

    } catch (error) {
      console.error('Error en verificarCodigo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Verificar estado del token
  async verificarToken(req, res) {
    try {
      // El middleware ya verificó el token, solo devolvemos la info
      res.json({
        success: true,
        usuario: req.usuario
      });
    } catch (error) {
      console.error('Error en verificarToken:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

export default LoginController;
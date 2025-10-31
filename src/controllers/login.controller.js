import { LoginModel } from '../models/login.model.js';
import { sendEmail } from '../middleware/sendEmail.js';
import { generarToken } from '../middleware/tokens.js';
import bcrypt from 'bcrypt';

export const LoginController = {
  // Paso 1: Solicitar inicio de sesión y enviar código
  async solicitarLogin(req, res) {
    try {
      const { correo, contrasenia } = req.body;

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

      // Verificar contraseña (asumiendo que está hasheada)
      const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
      
      if (!contraseniaValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar código de verificación (6 dígitos)
      const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar código en la base de datos
      await LoginModel.saveVerificationCode(usuario.id_usuario, codigoVerificacion);

      // Enviar código por correo
      await sendEmail({
        to: correo,
        subject: 'Código de verificación - Sistema de Gestión',
        text: `Tu código de verificación es: ${codigoVerificacion}\n\nEste código expirará en 10 minutos.`
      });

      // Limpiar códigos expirados
      await LoginModel.cleanExpiredCodes();

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

  // Verificar estado del token (opcional)
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

// Agregar método auxiliar al modelo
LoginModel.findByUserId = async (userId) => {
  try {
    const query = `
      SELECT 
        u.id_usuario,
        u.nombre,
        u.correo,
        u.id_rol,
        r.nombre_rol as rol
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Error al buscar usuario por ID: ${error.message}`);
  }
};
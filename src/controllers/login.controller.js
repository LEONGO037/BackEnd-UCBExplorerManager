import { LoginModel } from '../models/login.model.js';
import { sendEmail } from '../middlewares/sendEmail.js';
import { generarToken } from '../middlewares/tokens.js';
import bcrypt from 'bcrypt';

// 🔐 FUNCIÓN INDEPENDIENTE PARA ALERTAS
async function enviarAlertaSimple(usuario, actividadSospechosa) {
  try {
    const mensajeAlerta = `
Se detectó actividad inusual en la cuenta:

Usuario: ${usuario.correo}
Intentos recientes: ${actividadSospechosa.intentosRecientes}
Hora: ${new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}

Se recomienda verificar la actividad.
    `;

    // Enviar alerta al administrador
    await sendEmail({
      to: usuario.correo,
      subject: 'Alerta de actividad inusual',
      text: mensajeAlerta
    });

    console.log('📧 Alerta de seguridad enviada');

  } catch (error) {
    console.error('Error al enviar alerta:', error.message);
  }
}

const LoginController = {
  async solicitarLogin(req, res) {
    try {
      const { correo, contrasenia } = req.body;

      console.log('Datos recibidos:', req.body);

      // Validación
      if (!correo || !contrasenia) {
        return res.status(400).json({
          success: false,
          message: 'Correo y contraseña son requeridos'
        });
      }

      // Sanitización básica
      const correoSaneado = correo.toString().trim().toLowerCase();
      const contraseniaSaneada = contrasenia.toString();

      const usuario = await LoginModel.findByEmail(correoSaneado);
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      console.log('Usuario encontrado:', usuario.id_usuario);

      // Verificar contraseña
      const contraseniaValida = await bcrypt.compare(contraseniaSaneada, usuario.contrasenia);
      
      if (!contraseniaValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // 🔐 PRIMERO REGISTRAR EL LOG ACTUAL
      await LoginModel.registrarLogLogin(usuario.id_usuario);
      console.log('📝 Log registrado para usuario:', usuario.id_usuario);

      // 🔐 LUEGO VERIFICAR ACTIVIDAD SOSPECHOSA (INCLUYENDO EL LOG ACTUAL)
      const actividadSospechosa = await LoginModel.verificarActividadSospechosa(usuario.id_usuario);
      console.log('🔍 Resultado verificación actividad:', actividadSospechosa);
      
      if (actividadSospechosa.esSospechoso) {
        console.warn(`⚠️ Actividad sospechosa detectada para usuario ${usuario.correo}: ${actividadSospechosa.intentosRecientes} intentos`);
        
        // Enviar alerta simple por correo
        await enviarAlertaSimple(usuario, actividadSospechosa);
      }

      // Generar código de verificación
      const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar código en la base de datos
      await LoginModel.saveVerificationCode(usuario.id_usuario, codigoVerificacion);

      // Enviar código por correo
      await sendEmail({
        to: usuario.correo,
        subject: 'Código de verificación',
        text: `Tu código de verificación es: ${codigoVerificacion}\n\nExpira en 10 minutos.`
      });

      res.json({
        success: true,
        message: 'Código de verificación enviado',
        correo: usuario.correo,
        requiereVerificacion: true,
        intentosRecientes: actividadSospechosa.intentosRecientes // Para debug
      });

    } catch (error) {
      console.error('Error en solicitarLogin:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  async verificarCodigo(req, res) {
    try {
      const { correo, codigo } = req.body;

      if (!correo || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'Correo y código son requeridos'
        });
      }

      // Sanitización
      const correoSaneado = correo.toString().trim().toLowerCase();
      const codigoSaneado = codigo.toString().trim();

      // Validar código
      const codigoValido = await LoginModel.validateVerificationCodeByEmail(correoSaneado, codigoSaneado);
      
      if (!codigoValido) {
        return res.status(401).json({
          success: false,
          message: 'Código inválido o expirado'
        });
      }

      // Obtener datos del usuario
      const usuario = await LoginModel.findByEmail(correoSaneado);
      
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

  // ✅ FUNCIÓN VERIFICAR TOKEN
  async verificarToken(req, res) {
    try {
      res.json({
        success: true,
        usuario: {
          id_usuario: req.usuario.id_usuario,
          nombre: req.usuario.nombre,
          correo: req.usuario.correo,
          rol: req.usuario.rol,
          id_rol: req.usuario.id_rol
        }
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
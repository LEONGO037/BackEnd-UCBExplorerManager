import {pool} from '../config/db.js';

export const LoginModel = {
  async findByEmail(correo) {
    let client;
    try {
      console.log('🔍 Buscando usuario con correo:', correo);
      client = await pool.connect();
      
      const query = `
        SELECT 
          u.id_usuario,
          u.nombre,
          u.correo,
          u.contrasenia,
          u.id_rol,
          r.nombre_rol as rol 
        FROM usuarios u
        LEFT JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.correo = $1
      `;
      
      const result = await client.query(query, [correo]);
      return result.rows[0] || null;

    } catch (error) {
      console.error('❌ ERROR en findByEmail:', error.message);
      throw new Error(`Error al buscar usuario: ${error.message}`);
    } finally {
      if (client) client.release();
    }
  },

  async saveVerificationCode(userId, code) {
    let client;
    try {
      client = await pool.connect();
      
      // Primero eliminamos cualquier código existente para este usuario
      await client.query(
        'DELETE FROM codigos_verificacion WHERE id_usuario = $1',
        [userId]
      );

      // Insertamos el nuevo código con expiración de 10 minutos en hora de La Paz
      const query = `
        INSERT INTO codigos_verificacion (id_usuario, codigo, expiracion)
        VALUES ($1, $2, (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz') + INTERVAL '10 minutes')
      `;
      await client.query(query, [userId, code]);
      
    } catch (error) {
      console.error('❌ ERROR en saveVerificationCode:', error.message);
      throw new Error(`Error al guardar código: ${error.message}`);
    } finally {
      if (client) client.release();
    }
  },

  async validateVerificationCodeByEmail(correo, codigo) {
    let client;
    try {
      client = await pool.connect();
      
      // Buscar el usuario por correo para obtener su ID
      const usuario = await this.findByEmail(correo);
      if (!usuario) {
        return false;
      }

      // Validar el código usando el ID del usuario
      const query = `
        SELECT id_usuario 
        FROM codigos_verificacion 
        WHERE id_usuario = $1 
        AND codigo = $2 
        AND expiracion > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')
        AND usado = false
      `;
      const result = await client.query(query, [usuario.id_usuario, codigo]);
      
      if (result.rows.length > 0) {
        // Marcar el código como usado
        await client.query(
          'UPDATE codigos_verificacion SET usado = true WHERE id_usuario = $1 AND codigo = $2',
          [usuario.id_usuario, codigo]
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ ERROR en validateVerificationCodeByEmail:', error.message);
      throw new Error(`Error al validar código: ${error.message}`);
    } finally {
      if (client) client.release();
    }
  },

  // Función para limpiar códigos expirados
  async cleanExpiredCodes() {
    let client;
    try {
      client = await pool.connect();
      const query = `
        DELETE FROM codigos_verificacion 
        WHERE expiracion <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')
      `;
      await client.query(query);
    } catch (error) {
      console.error('Error limpiando códigos expirados:', error);
    } finally {
      if (client) client.release();
    }
  },

  // 🔐 FUNCIONES SIMPLIFICADAS PARA DETECCIÓN DE ACTIVIDAD
  
  // Registrar log de inicio de sesión (simplificado)
  async registrarLogLogin(userId) {
    let client;
    try {
      client = await pool.connect();
      
      const query = `
        INSERT INTO logs (id_usuario, fechahora)
        VALUES ($1, (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz'))
      `;
      await client.query(query, [userId]);
      
    } catch (error) {
      console.error('❌ ERROR en registrarLogLogin:', error.message);
    } finally {
      if (client) client.release();
    }
  },

  // Verificar actividad sospechosa (simplificado)
  async verificarActividadSospechosa(userId) {
    let client;
    try {
      client = await pool.connect();
      
      // Consultar intentos de login en los últimos 15 minutos (hora La Paz)
      const query = `
        SELECT COUNT(*) as intentos_recientes
        FROM logs 
        WHERE id_usuario = $1 
        AND fechahora >= ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz') - INTERVAL '15 minutes')
      `;
      
      const result = await client.query(query, [userId]);
      const intentosRecientes = parseInt(result.rows[0].intentos_recientes);
      
      return {
        esSospechoso: intentosRecientes >= 3, // 3 o más intentos en 15 minutos
        intentosRecientes: intentosRecientes
      };
      
    } catch (error) {
      console.error('❌ ERROR en verificarActividadSospechosa:', error.message);
      return { esSospechoso: false, intentosRecientes: 0 };
    } finally {
      if (client) client.release();
    }
  }
};
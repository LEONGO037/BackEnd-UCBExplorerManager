import pool from '../config/db.js';

export const LoginModel = {
  // Buscar usuario por correo
  async findByEmail(correo) {
    try {
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
      const result = await pool.query(query, [correo]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  },

  // Guardar código de verificación
  async saveVerificationCode(userId, code) {
    try {
      // Primero eliminamos cualquier código existente
      await pool.query(
        'DELETE FROM codigos_verificacion WHERE id_usuario = $1',
        [userId]
      );

      // Insertamos el nuevo código con expiración de 10 minutos
      const query = `
        INSERT INTO codigos_verificacion (id_usuario, codigo, expiracion)
        VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
      `;
      await pool.query(query, [userId, code]);
    } catch (error) {
      throw new Error(`Error al guardar código: ${error.message}`);
    }
  },

  // Validar código de verificación
  async validateVerificationCode(userId, code) {
    try {
      const query = `
        SELECT id_usuario 
        FROM codigos_verificacion 
        WHERE id_usuario = $1 
        AND codigo = $2 
        AND expiracion > NOW()
        AND usado = false
      `;
      const result = await pool.query(query, [userId, code]);
      
      if (result.rows.length > 0) {
        // Marcar el código como usado
        await pool.query(
          'UPDATE codigos_verificacion SET usado = true WHERE id_usuario = $1 AND codigo = $2',
          [userId, code]
        );
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Error al validar código: ${error.message}`);
    }
  },

  // Limpiar códigos expirados
  async cleanExpiredCodes() {
    try {
      await pool.query('DELETE FROM codigos_verificacion WHERE expiracion <= NOW()');
    } catch (error) {
      console.error('Error limpiando códigos expirados:', error);
    }
  }
};
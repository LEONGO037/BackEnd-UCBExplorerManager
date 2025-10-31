// El archivo `db.js` está en `src/config/db.js`.
import { pool } from "../config/db.js";

export const LogsModel = {
  async getAllLogs() {
    const query = `
      SELECT 
        l.id_log,
        l.fechahora,
        u.nombre AS nombre_usuario,
        u.apellido AS apellido_usuario,
        r.nombre_rol,
        l.tipo_log,
        t.nombre AS tipo_log_nombre,
        t.descripcion AS tipo_log_descripcion
      FROM logs l
      INNER JOIN usuarios u ON l.id_usuario = u.id_usuario
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN tipos_log t ON l.tipo_log = t.id_tipo
      ORDER BY l.fechahora DESC;
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (err) {
      // Si la tabla `tipos_log` no existe en la base de datos, hacer una consulta alternativa
      // que omita el LEFT JOIN a `tipos_log` para no fallar la petición.
      if (err && err.code === '42P01' && /tipos_log/.test(err.message)) {
        const fallback = `
          SELECT 
            l.id_log,
            l.fechahora,
            u.nombre AS nombre_usuario,
            u.apellido AS apellido_usuario,
            r.nombre_rol,
            l.tipo_log
          FROM logs l
          INNER JOIN usuarios u ON l.id_usuario = u.id_usuario
          LEFT JOIN roles r ON u.id_rol = r.id_rol
          ORDER BY l.fechahora DESC;
        `;
        const fallbackResult = await pool.query(fallback);
        return fallbackResult.rows;
      }
      throw err;
    }
  },

  async getLogsByUser(id_usuario) {
    const query = `
      SELECT 
        l.id_log,
        l.fechahora,
        u.nombre AS nombre_usuario,
        u.apellido AS apellido_usuario,
        r.nombre_rol,
        l.tipo_log,
        t.nombre AS tipo_log_nombre,
        t.descripcion AS tipo_log_descripcion
      FROM logs l
      INNER JOIN usuarios u ON l.id_usuario = u.id_usuario
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN tipos_log t ON l.tipo_log = t.id_tipo
      WHERE l.id_usuario = $1
      ORDER BY l.fechahora DESC;
    `;

    try {
      const result = await pool.query(query, [id_usuario]);
      return result.rows;
    } catch (err) {
      if (err && err.code === '42P01' && /tipos_log/.test(err.message)) {
        const fallback = `
          SELECT 
            l.id_log,
            l.fechahora,
            u.nombre AS nombre_usuario,
            u.apellido AS apellido_usuario,
            r.nombre_rol,
            l.tipo_log
          FROM logs l
          INNER JOIN usuarios u ON l.id_usuario = u.id_usuario
          LEFT JOIN roles r ON u.id_rol = r.id_rol
          WHERE l.id_usuario = $1
          ORDER BY l.fechahora DESC;
        `;
        const fallbackResult = await pool.query(fallback, [id_usuario]);
        return fallbackResult.rows;
      }
      throw err;
    }
  },

  async createLog({ id_usuario, tipo_log }) {
    const query = `
      INSERT INTO logs (id_usuario, fechaHora, tipo_log)
      VALUES ($1, NOW(), $2)
      RETURNING *;
    `;
    const result = await pool.query(query, [id_usuario, tipo_log]);
    return result.rows[0];
  },
};

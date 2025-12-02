import { pool } from "../config/db.js";

export const VisitsModel = {
  async getAll() {
    const query = `
      SELECT v.id_visita, v.fecha, v.hora, v.id_guia, v.estado, v.observaciones, v.id_usuario, v.id_colegio,
        g.nombre AS guia_nombre, g.apellido AS guia_apellido,
        c.nombre AS colegio_nombre
      FROM visitas v
      LEFT JOIN guias g ON v.id_guia = g.id_guia
      LEFT JOIN colegios c ON v.id_colegio = c.id_colegio
      ORDER BY v.fecha DESC, v.hora DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getById(id) {
    const query = `
      SELECT v.id_visita, v.fecha, v.hora, v.id_guia, v.estado, v.observaciones, v.id_usuario, v.id_colegio,
        g.nombre AS guia_nombre, g.apellido AS guia_apellido,
        c.nombre AS colegio_nombre
      FROM visitas v
      LEFT JOIN guias g ON v.id_guia = g.id_guia
      LEFT JOIN colegios c ON v.id_colegio = c.id_colegio
      WHERE v.id_visita = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async create({ fecha, hora, id_guia, estado, observaciones, id_usuario, id_colegio }) {
    const query = `
      INSERT INTO visitas (fecha, hora, id_guia, estado, observaciones, id_usuario, id_colegio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const result = await pool.query(query, [fecha, hora, id_guia, estado, observaciones, id_usuario, id_colegio]);
    return result.rows[0];
  },

  async update(id, { fecha, hora, id_guia, estado, observaciones, id_usuario, id_colegio }) {
    const query = `
      UPDATE visitas SET
        fecha = COALESCE($2, fecha),
        hora = COALESCE($3, hora),
        id_guia = COALESCE($4, id_guia),
        estado = COALESCE($5, estado),
        observaciones = COALESCE($6, observaciones),
        id_usuario = COALESCE($7, id_usuario),
        id_colegio = COALESCE($8, id_colegio)
      WHERE id_visita = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, fecha, hora, id_guia, estado, observaciones, id_usuario, id_colegio]);
    return result.rows[0];
  },

  async delete(id) {
    const query = `DELETE FROM visitas WHERE id_visita = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Additional helpers
  async getByColegio(id_colegio) {
    const query = `SELECT * FROM visitas WHERE id_colegio = $1 ORDER BY fecha DESC, hora DESC;`;
    const result = await pool.query(query, [id_colegio]);
    return result.rows;
  },

  async getByGuia(id_guia) {
    const query = `SELECT * FROM visitas WHERE id_guia = $1 ORDER BY fecha DESC, hora DESC;`;
    const result = await pool.query(query, [id_guia]);
    return result.rows;
  }
};

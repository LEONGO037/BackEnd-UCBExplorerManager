import { pool } from "../config/db.js";

export const GuiasModel = {
  async getAll() {
    const query = `SELECT id_guia, nombre, apellido FROM guias ORDER BY nombre, apellido;`;
    const result = await pool.query(query);
    return result.rows;
  },

  async getById(id) {
    const query = `SELECT id_guia, nombre, apellido FROM guias WHERE id_guia = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async create({ nombre, apellido }) {
    const query = `
      INSERT INTO guias (nombre, apellido)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pool.query(query, [nombre, apellido]);
    return result.rows[0];
  },

  async update(id, { nombre, apellido }) {
    const query = `
      UPDATE guias SET
        nombre = COALESCE($2, nombre),
        apellido = COALESCE($3, apellido)
      WHERE id_guia = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, nombre, apellido]);
    return result.rows[0];
  },

  async delete(id) {
    const query = `DELETE FROM guias WHERE id_guia = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

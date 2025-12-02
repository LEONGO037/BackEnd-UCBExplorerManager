import { pool } from "../config/db.js";

export const ColegiosModel = {
  async getAll() {
    const query = `SELECT id_colegio, nombre, contacto, telefono, direccion FROM colegios ORDER BY nombre;`;
    const result = await pool.query(query);
    return result.rows;
  },

  async getById(id) {
    const query = `SELECT id_colegio, nombre, contacto, telefono, direccion FROM colegios WHERE id_colegio = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async create({ nombre, contacto, telefono, direccion }) {
    const query = `
      INSERT INTO colegios (nombre, contacto, telefono, direccion)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [nombre, contacto, telefono, direccion]);
    return result.rows[0];
  },

  async update(id, { nombre, contacto, telefono, direccion }) {
    const query = `
      UPDATE colegios SET
        nombre = COALESCE($2, nombre),
        contacto = COALESCE($3, contacto),
        telefono = COALESCE($4, telefono),
        direccion = COALESCE($5, direccion)
      WHERE id_colegio = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, nombre, contacto, telefono, direccion]);
    return result.rows[0];
  },

  async delete(id) {
    const query = `DELETE FROM colegios WHERE id_colegio = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

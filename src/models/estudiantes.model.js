import { pool } from "../config/db.js";

export const EstudiantesModel = {
  async getAll() {
    const query = `
      SELECT e.id_estudiante, e.nombre, e.edad, e.curso, e.ci, e.correo, e.id_colegio,
        c.nombre AS colegio_nombre
      FROM estudiantes e
      LEFT JOIN colegios c ON e.id_colegio = c.id_colegio
      ORDER BY e.nombre;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getById(id) {
    const query = `
      SELECT e.id_estudiante, e.nombre, e.edad, e.curso, e.ci, e.correo, e.id_colegio,
        c.nombre AS colegio_nombre
      FROM estudiantes e
      LEFT JOIN colegios c ON e.id_colegio = c.id_colegio
      WHERE e.id_estudiante = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async create({ nombre, edad, curso, ci, correo, id_colegio }) {
    const query = `
      INSERT INTO estudiantes (nombre, edad, curso, ci, correo, id_colegio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await pool.query(query, [nombre, edad, curso, ci, correo, id_colegio]);
    return result.rows[0];
  },

  async update(id, { nombre, edad, curso, ci, correo, id_colegio }) {
    const query = `
      UPDATE estudiantes SET
        nombre = COALESCE($2, nombre),
        edad = COALESCE($3, edad),
        curso = COALESCE($4, curso),
        ci = COALESCE($5, ci),
        correo = COALESCE($6, correo),
        id_colegio = COALESCE($7, id_colegio)
      WHERE id_estudiante = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, nombre, edad, curso, ci, correo, id_colegio]);
    return result.rows[0];
  },

  async delete(id) {
    const query = `DELETE FROM estudiantes WHERE id_estudiante = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async getByColegio(id_colegio) {
    const query = `
      SELECT id_estudiante, nombre, edad, curso, ci, correo, id_colegio
      FROM estudiantes
      WHERE id_colegio = $1
      ORDER BY nombre;
    `;
    const result = await pool.query(query, [id_colegio]);
    return result.rows;
  }
};

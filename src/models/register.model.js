import { pool } from '../db.js';

const registerUser = async (nombre, apellido, correo, contrasenia, id_rol) => {
    const query = {
        text: `
            INSERT INTO usuarios (
                nombre,
                apellido,
                correo,
                contrasenia,
                id_rol
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `,
        values: [nombre, apellido, correo, contrasenia, id_rol]
    };

    const { rows } = await pool.query(query);
    return rows[0];
};

const updatePasswordById = async (id_usuario, nuevaContraseniaHasheada) => {
    const query = {
        text: `
            UPDATE usuarios
            SET contrasenia = $1
            WHERE id_usuario = $2
            RETURNING id_usuario, nombre, apellido, correo, id_rol
        `,
        values: [nuevaContraseniaHasheada, id_usuario]
    };

    const { rows } = await pool.query(query);
    return rows[0];
};

export const registerModel = {
    registerUser,
    updatePasswordById
};
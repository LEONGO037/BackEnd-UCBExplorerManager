import { pool } from '../config/db.js';

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

const getUserById = async (id_usuario) => {
    const query = {
        text: `
            SELECT id_usuario, nombre, apellido, correo, contrasenia, id_rol
            FROM usuarios
            WHERE id_usuario = $1
        `,
        values: [id_usuario]
    };

    const { rows } = await pool.query(query);
    return rows[0]; // Retorna el primer usuario encontrado
};

const getLoginCount = async (id_usuario) => {
    const query = {
        text: `
            SELECT COUNT(*) as login_count
            FROM logs 
            WHERE id_usuario = $1 
            AND tipo_log = 1
        `,
        values: [id_usuario]
    };

    const { rows } = await pool.query(query);
    return parseInt(rows[0].login_count);
};

const checkEmailExists = async (correo) => {
    const query = {
        text: `
            SELECT EXISTS (
                SELECT 1 
                FROM usuarios 
                WHERE correo = $1
            ) as exists
        `,
        values: [correo]
    };

    const { rows } = await pool.query(query);
    return rows[0].exists;
};

const getUserByEmail = async (correo) => {
    const query = {
        text: `
            SELECT id_usuario, nombre, apellido, correo, contrasenia, id_rol
            FROM usuarios
            WHERE correo = $1
        `,
        values: [correo]
    };

    const { rows } = await pool.query(query);
    return rows[0];
};

const saveRecuperationCode = async (userId, code) => {
    let client;
    try {
      client = await pool.connect();
      
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
  };

const verifyRecuperationCode = async (userId, code) => {
    const query = {
        text: `
            SELECT EXISTS (
                SELECT 1 
                FROM codigos_verificacion 
                WHERE id_usuario = $1 
                AND codigo = $2 
                AND expiracion > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')
                AND usado = false
            ) as is_valid
        `,
        values: [userId, code]
    };

    try {
        const { rows } = await pool.query(query);
        return rows[0].is_valid;
    } catch (error) {
        console.error('❌ ERROR en verifyRecuperationCode:', error.message);
        throw new Error(`Error al verificar código: ${error.message}`);
    }
};

export const registerModel = {
    registerUser,
    updatePasswordById,
    getUserById,
    getLoginCount,
    checkEmailExists,
    getUserByEmail,
    saveRecuperationCode,
    verifyRecuperationCode
};
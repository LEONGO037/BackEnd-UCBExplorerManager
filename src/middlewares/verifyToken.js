import { verificarToken } from "./tokens.js";
import { decodedToken } from "./tokens.js";

const TokenMiddlewareAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Obtener el token
    console.log('token recibido', token);

    if (!token || !verificarToken(token)) {
        return res.status(403).json({
            success: 'false',
            message: 'Vuelva a iniciar sesión'
        });
    }

    try {
        const decoded = await decodedToken(token);  // Esperar la decodificación del token
        if (decoded && decoded.rol === 1) {
            next();  // Si el rol es 1 (admin), pasa al siguiente middleware
        } else {
            return res.status(403).json({
                success: 'false',
                message: 'Rol incorrecto'
            });
        }
    } catch (error) {
        console.log('Error al decodificar el token:', error);
        return res.status(403).json({
            success: 'false',
            message: 'Token inválido o expirado'
        });
    }
};

const TokenMiddlewareDocente = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Obtener el token
    if (!token || !verificarToken(token)) {
        return res.status(403).json({
            success: 'false',
            message: 'Vuelva a iniciar sesión'
        });
    }

    try {
        const decoded = await decodedToken(token);  // Esperar la decodificación del token
        if (decoded && decoded.rol === 2) {
            next();  // Si el rol es 2 (docente), pasa al siguiente middleware
        } else {
            return res.status(403).json({
                success: 'false',
                message: 'Rol incorrecto'
            });
        }
    } catch (error) {
        console.log('Error al decodificar el token:', error);
        return res.status(403).json({
            success: 'false',
            message: 'Token inválido o expirado'
        });
    }
};

const TokenMiddlewareEstudiante = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Obtener el token
    if (!token || !verificarToken(token)) {
        return res.status(403).json({
            success: 'false',
            message: 'Vuelva a iniciar sesión'
        });
    }

    try {
        const decoded = await decodedToken(token);  // Esperar la decodificación del token
        if (decoded && decoded.rol === 3) {
            next();  // Si el rol es 3 (estudiante), pasa al siguiente middleware
        } else {
            return res.status(403).json({
                success: 'false',
                message: 'Rol incorrecto'
            });
        }
    } catch (error) {
        console.log('Error al decodificar el token:', error);
        return res.status(403).json({
            success: 'false',
            message: 'Token inválido o expirado'
        });
    }
};

export const TokenVerify = {
    TokenMiddlewareEstudiante,
    TokenMiddlewareDocente,
    TokenMiddlewareAdmin
};

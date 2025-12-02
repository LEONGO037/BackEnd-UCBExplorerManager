import bcrypt from 'bcrypt';
import { registerModel } from '../models/register.model.js';
import { sendEmail } from '../middlewares/sendEmail.js';
import { LoginModel } from '../models/login.model.js';
import { decodedToken } from '../middlewares/tokens.js';

const register = async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasenia, id_rol } = req.body;

        if (!nombre || !apellido || !correo || !contrasenia || !id_rol) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        if (id_rol !== 1 && id_rol !== 2) {
            return res.status(400).json({ message: 'Rol inválido' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasenia, salt);

        const newUser = await registerModel.registerUser(
            nombre,
            apellido,
            correo,
            hashedPassword,
            id_rol
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: newUser
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }
        return res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        // Obtener token (Authorization: Bearer <token>)
        const authHeader = req.headers.authorization || req.headers['x-access-token'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        const decoded = await decodedToken(token);
        if (!decoded || !decoded.id_usuario) {
            return res.status(401).json({ message: 'Token inválido o no proporcionado' });
        }

        const id_usuario = decoded.id_usuario;
        const { contrasenia_actual, nueva_contrasenia } = req.body;

        if (!contrasenia_actual || !nueva_contrasenia) {
            return res.status(400).json({ message: 'Faltan campos: contrasenia_actual y nueva_contrasenia son requeridos' });
        }

        if (nueva_contrasenia.length < 6) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }

        //Obtener usuario y verificar contraseña actual
        const usuario = await registerModel.getUserById(id_usuario);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const match = await bcrypt.compare(contrasenia_actual, usuario.contrasenia);
        if (!match) {
            return res.status(400).json({ message: 'Contraseña actual incorrecta' });
        }

        // Hashear y actualizar
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(nueva_contrasenia, salt);

        const updated = await registerModel.updatePasswordById(id_usuario, hashed);

        return res.status(200).json({ message: 'Contraseña actualizada correctamente', user: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Error al cambiar la contraseña', error: error.message });
    }
};

const hasLoggedInBefore = async (req, res) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization || req.headers['x-access-token'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        // Decodificar token
        const decoded = await decodedToken(token);
        if (!decoded || !decoded.id_usuario) {
            return res.status(401).json({ message: 'Token inválido o no proporcionado' });
        }

        // Obtener cantidad de logins
        const loginCount = await registerModel.getLoginCount(decoded.id_usuario);
        
        // Retornar true si tiene al menos un login, false en caso contrario
        return res.status(200).json({
            hasLoggedBefore: loginCount > 1
        });

    } catch (error) {
        return res.status(500).json({ 
            message: 'Error al verificar historial de inicio de sesión', 
            error: error.message 
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { correo } = req.body;
        console.log('Verificando correo:', correo);

        if (!correo) {
            return res.status(400).json({
                success: false,
                message: 'El correo es requerido'
            });
        }

        // Verificar si el correo existe
        const usuario = await registerModel.getUserByEmail(correo);
        console.log('Usuario encontrado:', usuario);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Correo no registrado en el sistema'
            });
        }

        // Generar código de verificación
        const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Código generado:', codigoVerificacion);

        // Enviar código por correo
        await sendEmail({
            to: correo,
            subject: 'Código de verificación - Recuperación de contraseña',
            text: `Tu código de verificación es: ${codigoVerificacion}\n\nEste código expirará en 10 minutos.`
        });
        console.log('Email enviado correctamente');

        await registerModel.saveRecuperationCode(usuario.id_usuario, codigoVerificacion);

        // Enviar respuesta exitosa
        return res.status(200).json({
            success: true,
            message: 'Código de verificación enviado al correo exitosamente',
            correo: correo
        });

    } catch (error) {
        console.error('Error completo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud',
            error: error.message
        });
    }
};

const verifyCode = async (req, res) => {
    try {
        const { correo, codigo } = req.body;
        console.log('Verificando código para:', correo);

        if (!correo || !codigo) {
            return res.status(400).json({
                success: false,
                message: 'El correo y el código son requeridos'
            });
        }

        // Obtener usuario por correo
        const usuario = await registerModel.getUserByEmail(correo);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si el código es válido
        const isValid = await registerModel.verifyRecuperationCode(usuario.id_usuario, codigo);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido o expirado'
            });
        }

        // Si el código es válido, devolver datos del usuario
        return res.status(200).json({
            success: true,
            message: 'Código verificado correctamente',
            usuario: {
                id_usuario: usuario.id_usuario,
                correo: usuario.correo
            }
        });

    } catch (error) {
        console.error('Error en verifyCode:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar el código',
            error: error.message
        });
    }
};

const updatePasswordByEmail = async (req, res) => {
    try {
        const { correo, nueva_contrasenia } = req.body;

        if (!correo || !nueva_contrasenia) {
            return res.status(400).json({
                success: false,
                message: 'El correo y la nueva contraseña son requeridos'
            });
        }

        // Validar longitud mínima de la contraseña
        if (nueva_contrasenia.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Obtener usuario por correo
        const usuario = await registerModel.getUserByEmail(correo);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nueva_contrasenia, salt);

        // Actualizar la contraseña
        const updated = await registerModel.updatePasswordById(usuario.id_usuario, hashedPassword);

        return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente',
            usuario: {
                id_usuario: updated.id_usuario,
                correo: updated.correo
            }
        });

    } catch (error) {
        console.error('Error en updatePasswordByEmail:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la contraseña',
            error: error.message
        });
    }
};

export const RegisterController = {
    register,
    changePassword,
    hasLoggedInBefore,
    verifyEmail,
    verifyCode,
    updatePasswordByEmail
};
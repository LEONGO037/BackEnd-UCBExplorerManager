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

        // Solo intentar guardar el código si LoginModel está disponible
        if (LoginModel && typeof LoginModel.saveVerificationCode === 'function') {
            await LoginModel.saveVerificationCode(usuario.id_usuario, codigoVerificacion);
            console.log('Código guardado en base de datos');
        } else {
            console.warn('LoginModel.saveVerificationCode no está disponible');
        }

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

export const RegisterController = {
    register,
    changePassword,
    hasLoggedInBefore,
    verifyEmail  // Añadimos la nueva función
};
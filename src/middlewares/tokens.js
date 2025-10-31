import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.secretWord;

// Middleware para verificar si el token es válido
export const verificarToken = (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(403).json({ 
      success: false,
      message: 'Acceso denegado. No hay token.' 
    });
  }

  try {
    // Limpiar prefijo "Bearer " si existe
    let cleanToken = token;
    if (token.startsWith("Bearer ")) {
      cleanToken = token.split(" ")[1];
    }

    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Token no válido.' 
    });
  }
};

// Middleware para verificar el rol del usuario
export const verificarRol = (rolesPermitidos) => (req, res, next) => {
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({ 
      success: false,
      message: 'Acceso denegado. No tiene los permisos necesarios.' 
    });
  }
  next();
};

// Función para generar el token JWT (actualizada para esta base de datos)
export const generarToken = (usuario) => {
  const payload = {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    id_rol: usuario.id_rol
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });
};

export const decodedToken = async (token) => {
  if (!token) {
    console.log("No se proporcionó token");
    return null;
  }

  // Limpiar prefijo "Bearer " si existe
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Token ya vencido o inválido");
        return reject(err);
      }

      const data = {
        id_usuario: decoded.id_usuario,
        nombre: decoded.nombre,
        correo: decoded.correo,
        rol: decoded.rol,
        id_rol: decoded.id_rol
      };
      resolve(data);
    });
  });
};
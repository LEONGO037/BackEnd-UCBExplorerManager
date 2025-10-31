import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { google } from 'googleapis';
import multer from 'multer';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

// Obtener el directorio actual del archivo (equivalente a __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración para multer (en memoria)
const storage = multer.memoryStorage(); // Almacena los archivos en la memoria
const upload = multer({ storage: storage }); // Configuración de multer

// Función para convertir un buffer a un stream
const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // Indica el final del stream
  return stream;
};

// Ruta de las credenciales
const credentialsPath = path.join(__dirname, '../../config/google-drive-credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

const cartasFolderId = '1Hj3H5jOWbASKB1ai9FDaiLJf-pW3Z2gk';
const propuestasFolderId = '1P_wQDR7TiCHC6yeF_YU4nHY6rHxvH6ub';
const perfilesFolderId = '1tm4E0fljZJtfzf79dA2NR-5QASaBCMHn';
const marcoTeoricoFolderId = '1bTtvna4GWsBrxGQY0gqoOpbN7erFHJla'; // Asumiendo que es el mismo ID que perfiles
const metodologiaVidaUtilFolderId = '1GBoGsv0bVOFLnXnJxvq-snqqTS1yNjtZ'; // Asumiendo que es el mismo ID que perfiles
const bdModeloC4FolderId = '1103qWdwE1ky54KboSXlkx0HGAXb6Hd8t'; // Asumiendo que es el mismo ID que perfiles
const analisisPreliminarFolderId = '11k7hiDwlHgeQHaLmE4ymHU01h_gpYqWv'; // Asumiendo que es el mismo ID que perfiles
const diagramasUMLFolderId = '1gpUY3agUd5bXEAuLFBfxNQP6aR-fLJE_'; // Asumiendo que es el mismo ID que perfiles

// Función para subir archivo a Google Drive
const uploadToGoogleDrive = async (fileBuffer, fileName, folderId) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    // Convertir el buffer a un stream
    const fileStream = bufferToStream(fileBuffer);

    const media = {
      mimeType: 'application/pdf', // O el tipo adecuado dependiendo del archivo
      body: fileStream
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    // Retorna el link de la vista previa en Google Drive
    if (response.data.webViewLink) {
      return response.data.webViewLink;
    } else {
      throw new Error('No se pudo obtener el enlace del archivo');
    }
  } catch (error) {
    console.error('Error al subir el archivo a Google Drive:', error);
    throw error;
  }
};

// Middleware para manejar la carga de archivos con multer
const fileUpload = upload.fields([
  { name: 'proyectoTrabajo', maxCount: 1 },
  { name: 'detallePropuesta', maxCount: 1 },
  { name: 'perfilFile', maxCount: 1 }, // Campo para el archivo del perfil,
  { name: 'marcoTeoricoFile', maxCount: 1 }, // Campo para el archivo del marco teórico
  { name: 'metodologiaVidaUtilFile', maxCount: 1 }, // Campo para el archivo de metodología y vida útil
  { name: 'bdFile', maxCount: 1 }, // Campo para el archivo de la bd
  { name: 'c4File', maxCount: 1 }, // Campo para el archivo del modelo C4
  { name: 'requerimientosFile', maxCount: 1 }, // Campo para el archivo de análisis preliminar
  { name: 'wireframesFile', maxCount: 1 }, // Campo para el archivo de análisis preliminar
  { name: 'diagramaUMLFile', maxCount: 1 } // Campo para el archivo de diagramas UML
]);

export { fileUpload,
  uploadToGoogleDrive,
  cartasFolderId, 
  propuestasFolderId, 
  perfilesFolderId, 
  marcoTeoricoFolderId, 
  metodologiaVidaUtilFolderId, 
  bdModeloC4FolderId, 
  analisisPreliminarFolderId,
  diagramasUMLFolderId
};

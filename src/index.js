import express from 'express';
import { port } from './config.js';
import registerRouter from './routes/register.routes.js';
import { setupSwagger } from './swagger.js';
import bodyParser from 'body-parser'; // { changed code }
import cors from 'cors';               // { changed code }

const app = express();

// Configurar Swagger
setupSwagger(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());  
app.use(express.json());  // Middleware para parsear JSON
app.use(express.urlencoded({ extended: true }));  // Middleware para parsear datos de formularios
app.use('/user', registerRouter);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});
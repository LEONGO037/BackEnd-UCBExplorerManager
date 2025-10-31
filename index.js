import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { port } from './config.js';
import registerRouter from './src/routes/register.routes.js';
import { setupSwagger } from './swagger.js';
import loginRouter from './src/routes/login.routes.js';

dotenv.config();

const app = express();

// Configurar Swagger
setupSwagger(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/user', registerRouter);

app.use('/api/login', loginRouter);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});

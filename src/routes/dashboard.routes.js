import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';

const router = Router();


// Ruta principal del dashboard (obtiene todos los datos)
router.get('/', DashboardController.getDashboardData);

// Obtener estadísticas generales
router.get('/stats', DashboardController.getStats);

// Obtener top colegios
router.get('/top-colegios', DashboardController.getTopColegios);

// Obtener visitas recientes
router.get('/visitas-recientes', DashboardController.getVisitasRecientes);

// Obtener visitas por mes
router.get('/visitas-mes', DashboardController.getVisitasPorMes);

// Obtener estudiantes por edad
router.get('/estudiantes-edad', DashboardController.getEstudiantesPorEdad);

// Obtener colegios por ciudad
router.get('/colegios-ciudad', DashboardController.getColegiosPorCiudad);

// Obtener métricas generales
router.get('/metricas', DashboardController.getMetricasGenerales);

// Obtener tendencias
router.get('/tendencias', DashboardController.getTendencias);

// Exportar reporte
router.get('/export', DashboardController.exportReport);

export default router;
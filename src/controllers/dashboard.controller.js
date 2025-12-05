import { DashboardModel } from "../models/dashboard.model.js";

export const DashboardController = {
  async getDashboardData(req, res) {
    try {
      const dashboardData = await DashboardModel.getAllDashboardData();
      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener datos del dashboard',
        error: error.message 
      });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await DashboardModel.getGeneralStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message 
      });
    }
  },

  async getTopColegios(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const topColegios = await DashboardModel.getTopColegios(limit);
      res.json({
        success: true,
        data: topColegios
      });
    } catch (error) {
      console.error('Error getting top colegios:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener top colegios',
        error: error.message 
      });
    }
  },

  async getVisitasRecientes(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const visitasRecientes = await DashboardModel.getVisitasRecientes(limit);
      res.json({
        success: true,
        data: visitasRecientes
      });
    } catch (error) {
      console.error('Error getting visitas recientes:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener visitas recientes',
        error: error.message 
      });
    }
  },

  async getVisitasPorMes(req, res) {
    try {
      const visitasPorMes = await DashboardModel.getVisitasPorMes();
      res.json({
        success: true,
        data: visitasPorMes
      });
    } catch (error) {
      console.error('Error getting visitas por mes:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener visitas por mes',
        error: error.message 
      });
    }
  },

  async getEstudiantesPorEdad(req, res) {
    try {
      const estudiantesPorEdad = await DashboardModel.getEstudiantesPorEdad();
      res.json({
        success: true,
        data: estudiantesPorEdad
      });
    } catch (error) {
      console.error('Error getting estudiantes por edad:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener distribución por edad',
        error: error.message 
      });
    }
  },

  async getColegiosPorCiudad(req, res) {
    try {
      const colegiosPorCiudad = await DashboardModel.getColegiosPorCiudad();
      res.json({
        success: true,
        data: colegiosPorCiudad
      });
    } catch (error) {
      console.error('Error getting colegios por ciudad:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener colegios por ciudad',
        error: error.message 
      });
    }
  },

  async getMetricasGenerales(req, res) {
    try {
      const metricas = await DashboardModel.getMetricasGenerales();
      res.json({
        success: true,
        data: metricas
      });
    } catch (error) {
      console.error('Error getting métricas generales:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener métricas generales',
        error: error.message 
      });
    }
  },

  async getTendencias(req, res) {
    try {
      const tendencias = await DashboardModel.getTendencias();
      res.json({
        success: true,
        data: tendencias
      });
    } catch (error) {
      console.error('Error getting tendencias:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener tendencias',
        error: error.message 
      });
    }
  },

  async exportReport(req, res) {
    try {
      const dashboardData = await DashboardModel.getAllDashboardData();
      
      const exportData = {
        fechaGeneracion: new Date().toISOString(),
        datos: dashboardData,
        resumen: {
          totalColegios: dashboardData.totalColegios,
          totalEstudiantes: dashboardData.totalEstudiantes,
          totalVisitas: dashboardData.totalVisitas,
          tasaConversion: dashboardData.metricasGenerales.tasaConversion,
          visitasFinalizadas: dashboardData.visitasFinalizadas,
          satisfaccionPromedio: dashboardData.satisfaccionPromedio
        }
      };
      
      res.json({
        success: true,
        message: 'Reporte generado exitosamente',
        data: exportData,
        downloadUrl: '/api/dashboard/export/excel',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al generar reporte de exportación',
        error: error.message 
      });
    }
  }
};
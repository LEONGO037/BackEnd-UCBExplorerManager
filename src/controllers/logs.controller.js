import { LogsModel } from "../models/logs.model.js";

export const LogsController = {
  // Obtener todos los logs con info del usuario, rol y tipo
  async getAll(req, res) {
    try {
      const logs = await LogsModel.getAllLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error al obtener logs:", error);
      res.status(500).json({ message: "Error al obtener logs" });
    }
  },

  // Obtener logs por usuario
  async getByUser(req, res) {
    try {
      const { id_usuario } = req.params;
      const logs = await LogsModel.getLogsByUser(id_usuario);
      res.json(logs);
    } catch (error) {
      console.error("Error al obtener logs por usuario:", error);
      res.status(500).json({ message: "Error al obtener logs por usuario" });
    }
  },

  // Registrar un nuevo log
  async create(req, res) {
    try {
      const { id_usuario, tipo_log } = req.body;

      if (!id_usuario || !tipo_log) {
        return res.status(400).json({ message: "id_usuario y tipo_log son requeridos" });
      }

      const newLog = await LogsModel.createLog({ id_usuario, tipo_log });
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error al crear log:", error);
      res.status(500).json({ message: "Error al crear log" });
    }
  },

  // Registrar un log para todos los usuarios (bulk)
  async createForAll(req, res) {
    try {
      const { tipo_log } = req.body;

      if (typeof tipo_log === 'undefined') {
        return res.status(400).json({ message: 'tipo_log es requerido' });
      }

      const tipo = Number(tipo_log);
      if (!Number.isInteger(tipo) || tipo < 1 || tipo > 5) {
        return res.status(400).json({ message: 'tipo_log debe ser un entero entre 1 y 5' });
      }

      const result = await LogsModel.createLogsForAll(tipo);
      res.status(201).json({ message: `${result.inserted} logs insertados`, rows: result.rows });
    } catch (error) {
      console.error('Error al crear logs para todos:', error);
      res.status(500).json({ message: 'Error al crear logs para todos' });
    }
  },
};

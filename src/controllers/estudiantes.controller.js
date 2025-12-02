import { EstudiantesModel } from "../models/estudiantes.model.js";

export const EstudiantesController = {
  async list(req, res) {
    try {
      const rows = await EstudiantesModel.getAll();
      res.json(rows);
    } catch (err) {
      console.error('Error getting estudiantes', err);
      res.status(500).json({ message: 'Error al obtener estudiantes' });
    }
  },

  async get(req, res) {
    try {
      const { id } = req.params;
      const row = await EstudiantesModel.getById(id);
      if (!row) return res.status(404).json({ message: 'Estudiante no encontrado' });
      res.json(row);
    } catch (err) {
      console.error('Error getting estudiante by id', err);
      res.status(500).json({ message: 'Error al obtener estudiante' });
    }
  },

  async create(req, res) {
    try {
      const data = req.body;
      const created = await EstudiantesModel.create(data);
      res.status(201).json(created);
    } catch (err) {
      console.error('Error creating estudiante', err);
      res.status(500).json({ message: 'Error al crear estudiante', error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await EstudiantesModel.update(id, data);
      res.json(updated);
    } catch (err) {
      console.error('Error updating estudiante', err);
      res.status(500).json({ message: 'Error al actualizar estudiante' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await EstudiantesModel.delete(id);
      res.json(deleted);
    } catch (err) {
      console.error('Error deleting estudiante', err);
      res.status(500).json({ message: 'Error al eliminar estudiante' });
    }
  },

  async byColegio(req, res) {
    try {
      const { id_colegio } = req.params;
      const rows = await EstudiantesModel.getByColegio(id_colegio);
      res.json(rows);
    } catch (err) {
      console.error('Error getting estudiantes by colegio', err);
      res.status(500).json({ message: 'Error al obtener estudiantes por colegio' });
    }
  }
};

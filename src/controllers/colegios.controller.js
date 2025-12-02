import { ColegiosModel } from "../models/colegios.model.js";

export const ColegiosController = {
  async list(req, res) {
    try {
      const rows = await ColegiosModel.getAll();
      res.json(rows);
    } catch (err) {
      console.error('Error getting colegios', err);
      res.status(500).json({ message: 'Error al obtener colegios' });
    }
  },

  async simpleList(req, res) {
    try {
      const rows = await ColegiosModel.getAll();
      // map to { id_colegio, nombre }
      res.json(rows.map(r => ({ id_colegio: r.id_colegio, nombre: r.nombre })));
    } catch (err) {
      console.error('Error getting simple colegios', err);
      res.status(500).json({ message: 'Error al obtener colegios' });
    }
  },

  async get(req, res) {
    try {
      const { id } = req.params;
      const row = await ColegiosModel.getById(id);
      if (!row) return res.status(404).json({ message: 'Colegio no encontrado' });
      res.json(row);
    } catch (err) {
      console.error('Error getting colegio by id', err);
      res.status(500).json({ message: 'Error al obtener colegio' });
    }
  },

  async create(req, res) {
    try {
      const data = req.body;
      const created = await ColegiosModel.create(data);
      res.status(201).json(created);
    } catch (err) {
      console.error('Error creating colegio', err);
      res.status(500).json({ message: 'Error al crear colegio' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await ColegiosModel.update(id, data);
      res.json(updated);
    } catch (err) {
      console.error('Error updating colegio', err);
      res.status(500).json({ message: 'Error al actualizar colegio' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ColegiosModel.delete(id);
      res.json(deleted);
    } catch (err) {
      console.error('Error deleting colegio', err);
      res.status(500).json({ message: 'Error al eliminar colegio' });
    }
  }
};

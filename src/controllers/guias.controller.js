import { GuiasModel } from "../models/guias.model.js";

export const GuiasController = {
  async list(req, res) {
    try {
      const rows = await GuiasModel.getAll();
      res.json(rows);
    } catch (err) {
      console.error('Error getting guias', err);
      res.status(500).json({ message: 'Error al obtener guias' });
    }
  },

  async simpleList(req, res) {
    try {
      const rows = await GuiasModel.getAll();
      res.json(rows.map(r => ({ id_guia: r.id_guia, nombre: r.nombre, apellido: r.apellido })));
    } catch (err) {
      console.error('Error getting simple guias', err);
      res.status(500).json({ message: 'Error al obtener guias' });
    }
  },

  async get(req, res) {
    try {
      const { id } = req.params;
      const row = await GuiasModel.getById(id);
      if (!row) return res.status(404).json({ message: 'Guia no encontrado' });
      res.json(row);
    } catch (err) {
      console.error('Error getting guia by id', err);
      res.status(500).json({ message: 'Error al obtener guia' });
    }
  },

  async create(req, res) {
    try {
      const data = req.body;
      const created = await GuiasModel.create(data);
      res.status(201).json(created);
    } catch (err) {
      console.error('Error creating guia', err);
      res.status(500).json({ message: 'Error al crear guia' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await GuiasModel.update(id, data);
      res.json(updated);
    } catch (err) {
      console.error('Error updating guia', err);
      res.status(500).json({ message: 'Error al actualizar guia' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await GuiasModel.delete(id);
      res.json(deleted);
    } catch (err) {
      console.error('Error deleting guia', err);
      res.status(500).json({ message: 'Error al eliminar guia' });
    }
  }
};

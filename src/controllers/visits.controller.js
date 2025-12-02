import { VisitsModel } from "../models/visits.model.js";

// Valores válidos y mapa de normalización (case-insensitive)
const ESTADOS_PERMITIDOS = ['Programada', 'En curso', 'Finalizada', 'Cancelada'];

function normalizeEstado(value) {
  if (typeof value !== 'string') return null;
  const low = value.trim().toLowerCase();
  if (low === 'programada' || low === 'programado') return 'Programada';
  if (low === 'en curso' || low === 'encurso' || low === 'en-curso') return 'En curso';
  if (low === 'finalizada' || low === 'finalizado') return 'Finalizada';
  if (low === 'cancelada' || low === 'cancelado') return 'Cancelada';
  // If exact match to allowed (case-insensitive)
  for (const e of ESTADOS_PERMITIDOS) if (e.toLowerCase() === low) return e;
  return null;
}

export const VisitsController = {
  async list(req, res) {
    try {
      const rows = await VisitsModel.getAll();
      res.json(rows);
    } catch (err) {
      console.error('Error getting visits', err);
      res.status(500).json({ message: 'Error al obtener visitas' });
    }
  },

  async get(req, res) {
    try {
      const { id } = req.params;
      const row = await VisitsModel.getById(id);
      if (!row) return res.status(404).json({ message: 'Visita no encontrada' });
      res.json(row);
    } catch (err) {
      console.error('Error getting visit by id', err);
      res.status(500).json({ message: 'Error al obtener visita' });
    }
  },

  async create(req, res) {
    try {
      const data = req.body;
      // Normalizar estado si se proporciona
      if (data.estado) data.estado = normalizeEstado(data.estado);
      if (data.estado === null) {
        return res.status(400).json({ message: 'Valor de estado inválido. Valores permitidos: Programada, En curso, Finalizada, Cancelada' });
      }
      const created = await VisitsModel.create(data);
      res.status(201).json(created);
    } catch (err) {
      console.error('Error creating visit', err);
      res.status(500).json({ message: 'Error al crear visita', error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Normalizar estado si se proporciona
      if (Object.prototype.hasOwnProperty.call(data, 'estado')) {
        data.estado = normalizeEstado(data.estado);
        if (data.estado === null) {
          return res.status(400).json({ message: 'Valor de estado inválido. Valores permitidos: Programada, En curso, Finalizada, Cancelada' });
        }
      }
      const updated = await VisitsModel.update(id, data);
      res.json(updated);
    } catch (err) {
      console.error('Error updating visit', err);
      // If it's a constraint violation, return a clearer message
      if (err && err.code === '23514') {
        return res.status(400).json({ message: 'Valor fuera de las opciones permitidas para una columna (constraint violation)', detail: err.detail });
      }
      res.status(500).json({ message: 'Error al actualizar visita' });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await VisitsModel.delete(id);
      res.json(deleted);
    } catch (err) {
      console.error('Error deleting visit', err);
      res.status(500).json({ message: 'Error al eliminar visita' });
    }
  },

  async byColegio(req, res) {
    try {
      const { id_colegio } = req.params;
      const rows = await VisitsModel.getByColegio(id_colegio);
      res.json(rows);
    } catch (err) {
      console.error('Error getting visits by colegio', err);
      res.status(500).json({ message: 'Error al obtener visitas por colegio' });
    }
  },

  async byGuia(req, res) {
    try {
      const { id_guia } = req.params;
      const rows = await VisitsModel.getByGuia(id_guia);
      res.json(rows);
    } catch (err) {
      console.error('Error getting visits by guia', err);
      res.status(500).json({ message: 'Error al obtener visitas por guia' });
    }
  }
};

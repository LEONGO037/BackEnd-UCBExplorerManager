
import { tutorModel } from '../models/tutor.model.js';


export const tutorController = {
    async obtenerEstudiantes(req, res) {
        try {
            const id_tutor = parseInt(req.params.id_tutor); // Obtener id_tutor desde la URL

            if (isNaN(id_tutor)) {
                return res.status(400).json({ message: 'ID de tutor inválido' });
            }

            const estudiantes = await tutorModel.obtenerEstudiantesPorTutor(id_tutor);

            if (estudiantes.length === 0) {
                return res.status(404).json({ 
                    message: 'No se encontraron estudiantes asignados a este tutor' 
                });
            }

            const resultado = estudiantes.reduce((acc, curr) => {
                const estudianteExistente = acc.find(e => e.progreso.id === curr.id_progreso);

                if (!estudianteExistente) {
                    const nuevoEstudiante = {
                        estudiante: {
                            nombres: curr.nombre_estudiante,
                            apellido_paterno: curr.apellido_paterno,
                            apellido_materno: curr.apellido_materno
                        },
                        progreso: {
                            id: curr.id_progreso
                        },
                        perfil: {
                            archivo: curr.perfil,
                            fecha_entrega: curr.fecha_entrega,
                            estado: curr.estado_perfil,
                            comentario: curr.comentario_perfil,
                            descripcion: curr.descripcion_perfil
                        },
                        marco_teorico: {
                            archivo: curr.marco,
                            fecha: curr.fecha_marco,
                            estado: curr.estado_marco,
                            comentario: curr.comentario_marco,
                            descripcion: curr.descripcion_marco
                        },
                        analisis_preliminar: {
                            requerimientos: curr.requerimientos,
                            wireframes: curr.wireframes,
                            estado: curr.estado_analisis,
                            comentario: curr.comentario_analisis,
                            fecha: curr.fecha_analisis,
                            descripcion: curr.descripcion_analisis
                        },
                        modelado_uml: {
                            estado: curr.estado_modelado,
                            comentario: curr.comentario_modelado,
                            fecha: curr.fecha_modelado,
                            descripcion: curr.descripcion_modelado,
                            diagramas: []
                        },
                        metodologia_vida_util: {
                            metodologia: curr.metodologia,
                            estado: curr.estado_mv,
                            comentario: curr.comentario_mv,
                            fecha: curr.fecha_mv,
                            descripcion: curr.descripcion_mv
                        },
                        bd_modelo_c4: {
                            bd: curr.bd,
                            c4: curr.c4,
                            estado: curr.estado_c4,
                            comentario: curr.comentario_c4,
                            fecha: curr.fecha_c4,
                            descripcion: curr.descripcion_c4
                        }
                    };

                    if (curr.id_diagrama) {
                        nuevoEstudiante.modelado_uml.diagramas.push({
                            id: curr.id_diagrama,
                            archivo: curr.doc_diagrama,
                            tipo: curr.tipo_diagrama
                        });
                    }

                    acc.push(nuevoEstudiante);
                } else {
                    if (curr.id_diagrama) {
                        estudianteExistente.modelado_uml.diagramas.push({
                            id: curr.id_diagrama,
                            archivo: curr.doc_diagrama,
                            tipo: curr.tipo_diagrama
                        });
                    }
                }

                return acc;
            }, []);

            res.status(200).json(resultado);
        } catch (error) {
            console.error('Error al obtener estudiantes del tutor:', error);
            res.status(500).json({ 
                message: 'Error interno del servidor',
                error: error.message 
            });
        }
    }
};

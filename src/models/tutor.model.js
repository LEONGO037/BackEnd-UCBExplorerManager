import { pool } from '../db.js';

const obtenerEstudiantesPorTutor = async (id_tutor) => {
    const query = {
        text: `
            SELECT
                p.id_progreso,
                per.nombres AS nombre_estudiante,
                per.apellido_paterno,
                per.apellido_materno,

                -- Datos de perfil
                perf.perfil,
                perf.fecha_entrega,
                perf.estado_perfil,
                perf.comentario_perfil,
                perf.descripcion AS descripcion_perfil,

                -- Marco teórico
                mt.marco,
                mt.fecha_marco,
                mt.estado_marco,
                mt.comentario_marco,
                mt.descripcion AS descripcion_marco,

                -- Análisis preliminar
                ap.requerimientos,
                ap.wireframes,
                ap.estado_analisis,
                ap.comentario_analisis,
                ap.fecha AS fecha_analisis,
                ap.descripcion AS descripcion_analisis,

                -- Modelado UML
                mu.estado_modelado,
                mu.comentario_modelado,
                mu.fecha AS fecha_modelado,
                mu.descripcion AS descripcion_modelado,

                -- Solo un diagrama por estudiante
                d.id_diagrama,
                d.doc_diagrama,
                td.nombre_tipo AS tipo_diagrama,

                -- BD y Modelo C4
                c4.estado_presentacion AS estado_c4,
                c4.comentario_presentacion AS comentario_c4,
                c4.fecha AS fecha_c4,
                c4.bd,
                c4.c4,
                c4.descripcion AS descripcion_c4,

                -- Metodología y vida útil
                mv.metodologia,
                mv.estado_presentacion AS estado_mv,
                mv.comentario_presentacion AS comentario_mv,
                mv.fecha AS fecha_mv,
                mv.descripcion AS descripcion_mv

            FROM progreso p
            INNER JOIN cuentas c_est ON p.id_estudiante = c_est.id_cuenta
            INNER JOIN persona per ON c_est.id_persona = per.id_persona

            -- JOINs opcionales por progreso
            LEFT JOIN perfil perf ON p.id_progreso = perf.id_progreso
            LEFT JOIN marco_teorico mt ON p.id_progreso = mt.id_progreso
            LEFT JOIN analisis_preliminar ap ON p.id_progreso = ap.id_progreso
            LEFT JOIN modelado_uml mu ON p.id_progreso = mu.id_progreso

            -- SOLO UN DIAGRAMA por progreso (el de menor id_diagrama)
            LEFT JOIN (
                SELECT d1.*
                FROM diagramas d1
                INNER JOIN (
                    SELECT id_progreso, MIN(id_diagrama) AS min_id
                    FROM diagramas
                    GROUP BY id_progreso
                ) d2 ON d1.id_progreso = d2.id_progreso AND d1.id_diagrama = d2.min_id
            ) d ON p.id_progreso = d.id_progreso
            LEFT JOIN tipo_diagrama td ON d.id_tipo = td.id_tipo

            -- BD y Metodología
            LEFT JOIN bd_modelo_c4 c4 ON p.id_progreso = c4.id_progreso
            LEFT JOIN metodologia_vida_util mv ON p.id_progreso = mv.id_progreso

            WHERE p.id_tutor = $1
            ORDER BY per.apellido_paterno, per.apellido_materno;
`,
        values: [id_tutor]
    };
    
    const { rows } = await pool.query(query);
    return rows;
};

export const tutorModel = {
    obtenerEstudiantesPorTutor
};
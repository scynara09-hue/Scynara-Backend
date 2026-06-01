import { insertEvaluation, getPublicEvaluations } from "../models/evaluations.model.js";

/**
 * Servicio para registrar una nueva evaluación
 */
export const createEvaluationService = async (id_usuario, calificacion, comentario) => {
  try {
    const result = await insertEvaluation(id_usuario, calificacion, comentario);
    
    return {
      success: true,
      message: "¡Gracias por tu reseña! Ha sido enviada y está pendiente de revisión.",
      id_evaluacion: result.insertId
    };
  } catch (error) {    // Lanzamos un error limpio para que el controlador lo atrape
    throw new Error("Ocurrió un error al intentar guardar la evaluación en la base de datos.");
  }
};

/**
 * Servicio para obtener evaluaciones públicas procesadas
 */
export const getPublicEvaluationsService = async () => {
  try {
    const evaluaciones = await getPublicEvaluations();

    // 💡 Lógica de negocio: Formatear los datos para la Landing Page
    const evaluacionesFormateadas = evaluaciones.map(ev => {
      
      // Extraer las iniciales del nombre (Ej: "María Ramírez" -> "MR")
      const partesNombre = ev.cliente_nombre.trim().split(' ');
      let iniciales = partesNombre[0].charAt(0).toUpperCase();
      
      if (partesNombre.length > 1) {
        iniciales += partesNombre[1].charAt(0).toUpperCase();
      }

      // Limpiar la ubicación por si viene vacía
      const ubicacion = ev.tienda_ubicacion ? ev.tienda_ubicacion : 'México';

      return {
        id_evaluacion: ev.id_evaluacion,
        calificacion: ev.calificacion,
        comentario: ev.comentario,
        autor: ev.cliente_nombre,
        iniciales: iniciales,
        empresa: `${ev.tienda_nombre} · ${ubicacion}`, // Ej: "Abarrotes La Esperanza · CDMX"
        fecha: ev.fecha_creacion
      };
    });

    return {
      success: true,
      data: evaluacionesFormateadas
    };
  } catch (error) {
    throw new Error("No se pudieron cargar los testimonios.");
  }
};
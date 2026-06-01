import { crearEvaluacionSchema } from "../schemas/evaluations.schema.js";
import { createEvaluationService, getPublicEvaluationsService } from "../services/evaluations.service.js";

/**
 * POST /api/evaluaciones
 * Controlador para crear una nueva evaluación (Protegido por JWT)
 */
export const createEvaluation = async (req, res) => {
  try {
    // 1. Validar el body usando Zod
    const validatedData = crearEvaluacionSchema.parse(req.body);

    // 2. Extraer el id del usuario (En tu token se llama 'sub')
    const userPayload = req.user; 
    const id_usuario = userPayload?.sub; // 💡 AQUÍ ESTÁ LA CORRECCIÓN

    // Si no encontramos un ID válido, cortamos el proceso
    if (!id_usuario) {
      return res.status(401).json({
        success: false,
        message: "No se pudo identificar al usuario en el token de sesión."
      });
    }

    // 3. Pasar los datos limpios al servicio
    const result = await createEvaluationService(
      id_usuario, 
      validatedData.calificacion, 
      validatedData.comentario
    );

    // 4. Responder éxito (201 Created)
    res.status(201).json(result);

  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Por favor, revisa los datos ingresados.",
        errors: error.errors.map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor."
    });
  }
};
/**
 * GET /api/evaluaciones/publicas
 * Controlador para obtener los testimonios de la Landing Page (Público)
 */
export const getPublicEvaluations = async (req, res) => {
  try {
    const result = await getPublicEvaluationsService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error al cargar las evaluaciones."
    });
  }
};
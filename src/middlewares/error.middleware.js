export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).json({
    mensaje: err.message || 'Error interno del servidor',
    // Esta línea asegura que los errores de Zod viajen al frontend
    details: err.details || null, 
  });
};
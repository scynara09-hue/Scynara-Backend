import { createVentaSchema } from '../schemas/venta.schema.js';
import * as VentaModel from '../models/venta.model.js';

export const getVentasList = async (tiendaId) => {
  return await VentaModel.findAllVentas(tiendaId);
};

export const getVentaDetails = async (id, tiendaId) => {
  const venta = await VentaModel.findVentaCompletaById(id, tiendaId);

  if (!venta) {
    const err = new Error('Venta no encontrada o no pertenece a tu sucursal');
    err.status = 404;
    throw err;
  }

  return venta;
};

export const addVenta = async (data) => {
  // 1. Validación estricta con Zod
  // El controlador ya debió inyectar id_tienda e id_usuario en 'data'
  const validation = createVentaSchema.safeParse(data);

  if (!validation.success) {
    const errorMessage = validation.error.issues?.[0]?.message ||
      validation.error.errors?.[0]?.message ||
      'Datos de venta inválidos';
    const err = new Error(errorMessage);
    err.status = 400;
    throw err;
  }

  // 2. Ejecutar la transacción en la base de datos
  // Si algo falla (ej. no hay stock), el modelo lanzará un error y el catch del controlador lo atrapará
  const idVenta = await VentaModel.createVentaTransaccion(validation.data);

  return {
    message: 'Venta procesada correctamente',
    id_venta: idVenta,
    total: validation.data.total
  };
};
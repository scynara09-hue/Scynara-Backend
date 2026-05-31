import { createVentaSchema } from '../schemas/venta.schema.js';
import * as VentaModel from '../models/venta.model.js';

// ─── OBTENER HISTORIAL DE VENTAS ───
export const getVentasList = async (tiendaId) => {
  return await VentaModel.findAllVentas(tiendaId);
};

// ─── OBTENER DETALLE DE UNA VENTA ───
export const getVentaDetails = async (id, tiendaId) => {
  const venta = await VentaModel.findVentaCompletaById(id, tiendaId);

  if (!venta) {
    const err = new Error('Venta no encontrada o no pertenece a tu sucursal');
    err.status = 404;
    throw err;
  }

  return venta;
};

// ─── PROCESAR NUEVA VENTA ───
export const addVenta = async (data) => {
  // 1. Validación estricta con Zod
  const validation = createVentaSchema.safeParse(data);

  if (!validation.success) {
    const err = new Error('Revisa los datos de la venta');
    err.status = 400;
    
    // Mapeamos TODOS los errores, soportando elementos anidados en el carrito
    const fieldErrors = {};
    validation.error.issues.forEach(issue => {
      fieldErrors[issue.path.join('.')] = issue.message;
    });
    
    err.errors = fieldErrors;
    throw err;
  }

  // 2. Ejecutar la transacción en la base de datos
  const idVenta = await VentaModel.createVentaTransaccion(validation.data);

  // 3. Respuesta exitosa
  return {
    message: 'Venta procesada correctamente',
    id_venta: idVenta,
    total: validation.data.total
  };
};

// ─── CANCELAR UNA VENTA ───
export const cancelVenta = async (id, tiendaId) => {
  // El modelo lanzará automáticamente un error 400 o 404 si la venta no existe 
  // o si ya había sido cancelada antes.
  await VentaModel.cancelVentaTransaccion(id, tiendaId);
  
  return { message: 'Venta cancelada y stock restaurado con éxito' };
};
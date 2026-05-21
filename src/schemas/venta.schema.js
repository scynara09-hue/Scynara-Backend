import { z } from 'zod';

// Esquema para cada producto dentro de la venta (Detalle de Venta)
const detalleVentaSchema = z.object({
  id_producto: z.number().int().positive('ID de producto inválido'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  // El precio al que se vendió en ese momento (por si luego cambia en el catálogo, el historial no se altera)
  precio_unitario_venta: z.number().min(0, 'El precio no puede ser negativo')
});

// Esquema principal para crear una Venta
export const createVentaSchema = z.object({
  // 💡 Estos dos los inyectará tu controlador leyendo el req.user
  id_tienda: z.number().int().positive('ID de tienda inválido'),
  id_usuario: z.number().int().positive('ID de usuario inválido'),

  // 💡 Datos que vienen del frontend
  id_cliente: z.number().int().positive('ID de cliente inválido'),
  total: z.number().min(0, 'El total no puede ser negativo'),

  // 💡 El carrito de compras (debe tener al menos 1 producto)
  detalles: z.array(detalleVentaSchema)
    .min(1, 'La venta debe incluir al menos un producto')
});
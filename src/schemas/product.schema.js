import { z } from 'zod';

// Esquema para crear un producto nuevo
export const createProductSchema = z.object({
  // 💡 NUEVO: Requerimos el id_tienda (que el backend inyectará desde el token)
  id_tienda: z.number().int().positive('El ID de la tienda es inválido'),
  
  id_proveedor: z.number().int().positive().nullable().optional(),
  id_categoria: z.number().int().positive().nullable().optional(),
  nombre: z.string()
    .min(2, 'El nombre del producto debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .trim(),
  cantidad: z.number()
    .int('La cantidad debe ser un número entero')
    .min(0, 'La cantidad no puede ser negativa')
    .default(0),
  precio_caja: z.number()
    .min(0, 'El precio por caja no puede ser negativo'),
  precio_unitario: z.number()
    .min(0, 'El precio unitario no puede ser negativo'),
  fecha_caducidad: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').nullable().optional()
});

// Esquema para actualizar un producto (todos los campos son opcionales)
export const updateProductSchema = z.object({
  // 💡 En la actualización no permitimos cambiar de tienda, 
  // el id_tienda se usará solo en el WHERE del modelo, por lo que no hace falta aquí.
  id_proveedor: z.number().int().positive().nullable().optional(),
  id_categoria: z.number().int().positive().nullable().optional(),
  nombre: z.string().min(2).max(100).trim().optional(),
  cantidad: z.number().int().min(0).optional(),
  precio_caja: z.number().min(0).optional(),
  precio_unitario: z.number().min(0).optional(),
  fecha_caducidad: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional()
});
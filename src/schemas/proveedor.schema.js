import { z } from 'zod';

export const createProveedorSchema = z.object({
  id_tienda: z.number().int().positive('ID de tienda inválido'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).trim(),
  telefono: z.string().max(20).optional().nullable(),
  correo: z.string().email('Formato de correo inválido').max(100).optional().nullable(),
  direccion: z.string().max(150).optional().nullable(),
  tiempo_entregas: z.string().max(50).optional().nullable(),
});

export const updateProveedorSchema = z.object({
  nombre: z.string().min(2).max(100).trim().optional(),
  telefono: z.string().max(20).optional().nullable(),
  correo: z.string().email().max(100).optional().nullable(),
  direccion: z.string().max(150).optional().nullable(),
  tiempo_entregas: z.string().max(50).optional().nullable(),
});
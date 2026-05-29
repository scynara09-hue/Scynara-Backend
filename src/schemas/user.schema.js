import { z } from 'zod';

// ─── 1. ESQUEMA BASE (COMÚN PARA TODOS) ───
const baseUserSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
    .trim(),

  apellidos: z.string({ required_error: 'El apellido es requerido' })
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(50, 'Los apellidos son demasiados largos')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Los apellidos solo pueden contener letras')
    .trim(),

  telefono: z.string({ required_error: 'El teléfono es requerido' })
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono es muy largo')
    .regex(/^\+?[0-9]+$/, 'El teléfono solo debe contener números')
    .trim(),

  email: z.string({ required_error: 'El correo electrónico es requerido' })
    .email('El formato del correo es inválido')
    .toLowerCase()
    .max(100, 'El correo es demasiado largo')
    .trim()
    .toLowerCase(),

  password: z.string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .max(72, 'La contraseña es demasiado larga (máx 72 caracteres)'),

  estado: z.enum(['ACTIVO', 'INACTIVO', 'BAJA']).default('ACTIVO'),
});

// ─── 2. ESQUEMAS ESPECÍFICOS POR ROL ───
const empleadoSchema = baseUserSchema.extend({
  rol: z.literal('EMPLEADO'),
  tipo_jornada: z.enum(['Completa', 'Medio']).default('Completa'),
  horario_entrada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Formato de hora inválido (HH:MM)').default('08:00'),
  horario_salida: z.string().regex(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Formato de hora inválido (HH:MM)').default('16:00'),
});

const administradorSchema = baseUserSchema.extend({
  rol: z.literal('ADMINISTRADOR'),
  nivel_acceso: z.enum(['BASICO', 'AVANZADO', 'TOTAL']).default('BASICO'),
  permisos: z.string().min(1, 'Los permisos son requeridos').default('ACCESO_GENERAL'),

  // 💡 CAMBIO: Ahora la tienda y dirección son obligatorios (Se quitó el .optional())
  nombre_tienda: z.string({ required_error: 'El nombre de la tienda es requerido' })
    .min(2, 'El nombre de la tienda debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la tienda es demasiado largo')
    .trim(),
    
  direccion_tienda: z.string({ required_error: 'La dirección de la tienda es requerida' })
    .min(5, 'Por favor, selecciona o ingresa una dirección válida')
    .max(150, 'La dirección es demasiado larga')
    .trim(),
});

// ─── 3. ESQUEMA DE REGISTRO CON PRE-PROCESAMIENTO ───
export const registerSchema = z.preprocess(
  (data) => {
    if (data && typeof data === 'object') {
      const processed = { ...data };

      if (typeof processed.rol === 'string') {
        processed.rol = processed.rol.trim().toUpperCase();
      }

      // Al eliminar los strings vacíos, obligamos a Zod a que dispare el "required_error"
      // en los campos obligatorios, y que aplique los .default() en los opcionales
      if (processed.nivel_acceso === "") delete processed.nivel_acceso;
      if (processed.permisos === "") delete processed.permisos;
      if (processed.tipo_jornada === "") delete processed.tipo_jornada;
      if (processed.horario_entrada === "") delete processed.horario_entrada;
      if (processed.horario_salida === "") delete processed.horario_salida;
      if (processed.nombre_tienda === "") delete processed.nombre_tienda;
      if (processed.direccion_tienda === "") delete processed.direccion_tienda;

      return processed;
    }
    return data;
  },
  z.discriminatedUnion('rol', [empleadoSchema, administradorSchema], {
    errorMap: () => ({ message: 'Rol inválido. Opciones permitidas: ADMINISTRADOR, EMPLEADO' })
  })
);

// ─── 4. ESQUEMA DE LOGIN ───
export const loginSchema = z.object({
  email: z.string({ required_error: 'El correo es requerido' })
    .email('El formato del correo es inválido')
    .trim()
    .toLowerCase(),
  password: z.string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida')
});

// ─── 5. ESQUEMA DE ACTUALIZACIÓN (UPDATE) ───
export const updateSchema = z.object({
  nombre: z.string().min(2).max(50).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).trim().optional(),
  apellidos: z.string().min(2).max(50).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).trim().optional(),
  telefono: z.string().min(10, 'Mínimo 10 dígitos').max(15).regex(/^\+?[0-9]+$/).trim().optional(),
  email: z.string().email().max(100).trim().toLowerCase().optional(),
  password: z.string().min(8).max(72).optional().or(z.literal('')),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'BAJA']).optional(),
  rol: z.enum(['ADMINISTRADOR', 'EMPLEADO']).optional(),

  tipo_jornada: z.enum(['Completa', 'Medio']).optional(),
  horario_entrada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/).optional(),
  horario_salida: z.string().regex(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/).optional(),
  nivel_acceso: z.enum(['BASICO', 'AVANZADO', 'TOTAL']).optional(),
  permisos: z.string().min(1).optional(),
  
  // Agregados por si necesitas permitir la actualización de estos datos después
  nombre_tienda: z.string().min(2).max(100).trim().optional(),
  direccion_tienda: z.string().min(5).max(150).trim().optional(),
});
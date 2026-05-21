import { loginSchema, registerSchema, updateSchema } from '../schemas/user.schema.js';
import {
  findUserByEmail,
  createUser,
  findUserById,
  findAllUsers,
  updateUserById,
  deleteUserById,
  findAdminByUserId
} from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';

export const loginUser = async (data) => {
  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    const errorMessage = validation.error.issues?.[0]?.message || validation.error.errors?.[0]?.message || 'Error de validación';
    const err = new Error(errorMessage);
    err.status = 400;
    throw err;
  }

  const { email, password } = validation.data;
  const user = await findUserByEmail(email);

  if (!user || user.estado !== 'ACTIVO' || !(await comparePassword(password, user.contrasena))) {
    const err = new Error('Credenciales inválidas o usuario inactivo');
    err.status = 401;
    throw err;
  }

  // 💡 NUEVO: Inyectamos el id_tienda en el JWT
  const token = signToken({
    sub: user.id_usuario,
    email: user.correo,
    rol: user.rol,
    id_tienda: user.id_tienda // ¡Clave para la seguridad!
  });

  return {
    user: {
      id: user.id_usuario,
      nombre: user.nombre,
      email: user.correo,
      rol: user.rol,
      id_tienda: user.id_tienda
    },
    token
  };
};

// 💡 NUEVO: Recibimos creatorTiendaId para saber a qué sucursal asignar a los nuevos
export const registerUser = async (data, creatorUserId, creatorTiendaId) => {
  // 1. Validación Zod PRIMERO
  const validation = registerSchema.safeParse(data);
  if (!validation.success) {
    const errorMessage = validation.error.issues?.[0]?.message ||
      validation.error.errors?.[0]?.message ||
      'Revisa los datos enviados';
    const err = new Error(errorMessage);
    err.status = 400;
    throw err;
  }

  const validData = { ...validation.data };

  // 2. Lógica de Registro (Externo vs Interno)
  if (!creatorUserId) {
    // REGISTRO EXTERNO: Alguien creando una cuenta nueva desde el Login/Register
    validData.rol = 'ADMINISTRADOR';
    validData.nivel_acceso = 'TOTAL'; // El primer admin tiene acceso total a su sucursal
    validData.id_admin_padre = null;

    if (!validData.nombre_tienda) {
      const err = new Error('Se requiere el nombre de la sucursal para un registro nuevo.');
      err.status = 400;
      throw err;
    }
  } else {
    // REGISTRO INTERNO: Un admin creando un empleado desde el Dashboard
    validData.id_tienda_existente = creatorTiendaId; // Hereda la tienda del creador

    const adminInfo = await findAdminByUserId(creatorUserId);

    if (!adminInfo) {
      const err = new Error('Acción no autorizada: Se requiere una sesión de administrador.');
      err.status = 403;
      throw err;
    }

    // Inyectar IDs de jerarquía
    if (validData.rol === 'EMPLEADO') {
      validData.id_admin_creador = adminInfo.id_admin;
    } else if (validData.rol === 'ADMINISTRADOR') {
      validData.id_admin_padre = adminInfo.id_admin;
    }
  }

  // 5. Verificación de duplicados
  if (await findUserByEmail(validData.email)) {
    const err = new Error('El correo ya está registrado');
    err.status = 409;
    throw err;
  }

  validData.password = await hashPassword(validData.password);

  // 6. Persistencia (El modelo nos devolverá también el id_tienda asignado)
  const newUser = await createUser(validData);

  const token = signToken({
    sub: newUser.id,
    email: validData.email,
    rol: validData.rol,
    id_tienda: newUser.id_tienda
  });

  return {
    user: {
      id: newUser.id,
      nombre: validData.nombre,
      email: validData.email,
      rol: validData.rol,
      id_tienda: newUser.id_tienda
    },
    token
  };
};

// ==========================================
// OPERACIONES CRUD (Protegidas por id_tienda)
// ==========================================

export const getAllUsers = async (adminUserId, tiendaId) => {
  const users = await findAllUsers(adminUserId, tiendaId);
  return users.map(({ contrasena, ...user }) => user);
};

export const getProfile = async (userId, tiendaId) => {
  const user = await findUserById(userId, tiendaId);
  if (!user) {
    const err = new Error('Usuario no encontrado o no pertenece a tu sucursal');
    err.status = 404;
    throw err;
  }
  const { contrasena, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUser = async (userId, tiendaId, data) => {
  if (data.password && data.password.trim() !== '') {
    data.password = await hashPassword(data.password);
  } else {
    delete data.password;
  }

  const result = await updateUserById(userId, tiendaId, data);
  if (!result) {
    const err = new Error('No se pudo actualizar el usuario');
    err.status = 500;
    throw err;
  }
  return { message: 'Usuario actualizado con éxito' };
};

export const deleteUser = async (userId, tiendaId) => {
  const result = await deleteUserById(userId, tiendaId);
  if (!result) {
    const err = new Error('No se pudo eliminar el usuario');
    err.status = 500;
    throw err;
  }
  return { message: 'Usuario eliminado con éxito' };
};
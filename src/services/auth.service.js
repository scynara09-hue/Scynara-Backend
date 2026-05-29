import { loginSchema, registerSchema, updateSchema } from '../schemas/user.schema.js';
import {
  findUserByEmail,
  createUser,
  findUserById,
  findUserByPhone,
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
    const formattedErrors = {};
    validation.error.issues.forEach((issue) => {
      formattedErrors[issue.path[0]] = issue.message;
    });

    const err = new Error('Error de validación');
    err.status = 400;
    err.errors = formattedErrors; 
    throw err;
  }

  const { email, password } = validation.data;
  const user = await findUserByEmail(email);

  if (!user || user.estado !== 'ACTIVO' || !(await comparePassword(password, user.contrasena))) {
    const err = new Error('Credenciales inválidas o usuario inactivo');
    err.status = 401;
    err.errors = { email: 'Revisa tu correo', password: 'O tu contraseña es incorrecta' }; 
    throw err;
  }

  const token = signToken({
    sub: user.id_usuario,
    email: user.correo,
    rol: user.rol,
    id_tienda: user.id_tienda 
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

export const registerUser = async (data, creatorUserId, creatorTiendaId) => {
  const validation = registerSchema.safeParse(data);
  if (!validation.success) {
    const formattedErrors = {};
    validation.error.issues.forEach((issue) => {
      formattedErrors[issue.path[0]] = issue.message;
    });

    const err = new Error('Revisa los datos enviados');
    err.status = 400;
    err.errors = formattedErrors; 
    throw err;
  }

  const validData = { ...validation.data };

  if (!creatorUserId) {
    validData.rol = 'ADMINISTRADOR';
    validData.nivel_acceso = 'TOTAL'; 
    validData.id_admin_padre = null;

    if (!validData.nombre_tienda) {
      const err = new Error('Se requiere el nombre de la sucursal para un registro nuevo.');
      err.status = 400;
      err.errors = { nombre_tienda: 'Se requiere el nombre de la sucursal' }; // Asignado al campo
      throw err;
    }
  } else {
    validData.id_tienda_existente = creatorTiendaId; 

    const adminInfo = await findAdminByUserId(creatorUserId);

    if (!adminInfo) {
      const err = new Error('Acción no autorizada: Se requiere una sesión de administrador.');
      err.status = 403;
      throw err;
    }

    if (validData.rol === 'EMPLEADO') {
      validData.id_admin_creador = adminInfo.id_admin;
    } else if (validData.rol === 'ADMINISTRADOR') {
      validData.id_admin_padre = adminInfo.id_admin;
    }
  }

  if (await findUserByEmail(validData.email)) {
    const err = new Error('El correo ya está registrado');
    err.status = 409;
    err.errors = { email: 'Este correo ya está en uso' }; 
    throw err;
  }

  if (await findUserByPhone(validData.telefono)) {
    const err = new Error('El teléfono ya está registrado');
    err.status = 409;
    err.errors = { telefono: 'Este número de teléfono ya está en uso' }; 
    throw err;
  }

  validData.password = await hashPassword(validData.password);

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
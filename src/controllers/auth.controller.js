import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  updateUser,
  deleteUser
} from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    // Si hay un token válido (registro interno), el middleware inyecta req.user
    const creatorUserId = req.user?.sub;
    const creatorTiendaId = req.user?.id_tienda; // Extraemos la tienda del creador

    // Pasamos la tienda del creador al servicio
    const result = await registerUser(req.body, creatorUserId, creatorTiendaId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export const getMe = async (req, res) => {
  try {
    const userId = req.user.sub;
    const tiendaId = req.user.id_tienda;

    const userProfile = await getProfile(userId, tiendaId);
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al obtener el perfil' });
  }
};


// ==========================================
// NUEVOS CONTROLADORES CRUD
// ==========================================

export const getUsers = async (req, res, next) => {
  try {
    const adminUserId = req.user.sub; // ID del admin logueado
    const tiendaId = req.user.id_tienda; // ID de su tienda

    // Pasamos ambos filtros al servicio
    const users = await getAllUsers(adminUserId, tiendaId);
    res.status(200).json(users);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al obtener usuarios' });
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tiendaId = req.user.id_tienda; // Capa de seguridad

    // Inyectamos el ID de la tienda para que el modelo verifique permisos
    const result = await updateUser(id, tiendaId, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al actualizar el usuario' });
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tiendaId = req.user.id_tienda; // Capa de seguridad

    // Inyectamos el ID de la tienda para evitar borrados entre sucursales
    const result = await deleteUser(id, tiendaId);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al eliminar el usuario' });
  }
};
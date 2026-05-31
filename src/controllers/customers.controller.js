import {
  getClientesList,
  getClienteDetails,
  addCliente,
  modifyCliente,
  removeCliente
} from '../services/customers.service.js';

// ─── OBTENER TODOS LOS CLIENTES ───
export const getAllClientes = async (req, res, next) => {
  try {
    // Extraemos el id de la tienda desde el token de autenticación del usuario
    const tiendaId = req.user.id_tienda; 
    
    const clientes = await getClientesList(tiendaId);
    res.status(200).json(clientes);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Error en getAllClientes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ─── OBTENER UN CLIENTE POR ID ───
export const getCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tiendaId = req.user.id_tienda;

    const cliente = await getClienteDetails(id, tiendaId);
    res.status(200).json(cliente);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Error en getCliente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ─── CREAR UN NUEVO CLIENTE ───
export const createCliente = async (req, res, next) => {
  try {
    const tiendaId = req.user.id_tienda;
    
    // Inyectamos el id_tienda al payload para pasárselo a Zod y a la BD
    const data = { ...req.body, id_tienda: tiendaId };
    
    const newCliente = await addCliente(data);
    res.status(201).json(newCliente);
  } catch (error) {
    // Aquí es donde la magia ocurre: si es 400, enviamos el mensaje Y los errores de Zod
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
        errors: error.errors // Contendrá { correo: "...", telefono: "..." }
      });
    }
    console.error("Error en createCliente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ─── ACTUALIZAR UN CLIENTE ───
export const updateCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tiendaId = req.user.id_tienda;

    const result = await modifyCliente(id, tiendaId, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
        errors: error.errors 
      });
    }
    console.error("Error en updateCliente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ─── ELIMINAR UN CLIENTE ───
export const deleteCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tiendaId = req.user.id_tienda;

    const result = await removeCliente(id, tiendaId);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Error en deleteCliente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
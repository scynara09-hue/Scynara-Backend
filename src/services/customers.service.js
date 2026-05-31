import { createClienteSchema, updateClienteSchema } from '../schemas/customers.schema.js';
import {
  findAllClientes,
  findClienteById,
  checkDuplicadosCliente,
  createCliente,
  updateClienteById,
  deleteClienteById
} from '../models/customers.model.js';

// ─── OBTENER TODOS LOS CLIENTES ───
export const getClientesList = async (tiendaId) => {
  return await findAllClientes(tiendaId);
};

// ─── OBTENER DETALLE DE UN CLIENTE ───
export const getClienteDetails = async (id, tiendaId) => {
  const cliente = await findClienteById(id, tiendaId);
  if (!cliente) {
    const err = new Error('Cliente no encontrado o no pertenece a tu sucursal');
    err.status = 404;
    throw err;
  }
  return cliente;
};

// ─── CREAR CLIENTE ───
export const addCliente = async (data) => {
  // 1. Validación estricta con Zod
  const validation = createClienteSchema.safeParse(data);
  if (!validation.success) {
    const err = new Error('Revisa los datos enviados');
    err.status = 400;
    
    // Mapeamos los errores para que el Frontend (React) sepa qué inputs pintar de rojo
    const fieldErrors = {};
    validation.error.issues.forEach(issue => {
      fieldErrors[issue.path[0]] = issue.message;
    });
    err.errors = fieldErrors; 
    throw err;
  }

  // 2. Validación de reglas de negocio cruzada (UNION DB)
  const duplicados = await checkDuplicadosCliente(
    validation.data.email, 
    validation.data.telefono, 
    validation.data.RFC,
    validation.data.id_tienda
  );
  
  if (duplicados) {
    const err = new Error('Algunos datos ya están registrados');
    err.status = 400;
    err.errors = duplicados; // Retorna { email: "...", telefono: "..." }
    throw err;
  }

  // 3. Inserción
  const clienteId = await createCliente(validation.data);
  return { id_cliente: clienteId, ...validation.data };
};

// ─── ACTUALIZAR CLIENTE ───
export const modifyCliente = async (id, tiendaId, data) => {
  // 💡 Fusionamos los datos del formulario con el id_tienda de la sesión
  const datosCompletos = { ...data, id_tienda: tiendaId };
  
  // 1. Validación estricta con Zod usando el objeto completo
  const validation = updateClienteSchema.safeParse(datosCompletos);
  if (!validation.success) {
    const err = new Error('Revisa los datos enviados');
    err.status = 400;
    
    const fieldErrors = {};
    validation.error.issues.forEach(issue => {
      fieldErrors[issue.path[0]] = issue.message;
    });
    err.errors = fieldErrors;
    throw err;
  }

  // 2. Validación cruzada excluyendo al propio cliente que se está editando
  const duplicados = await checkDuplicadosCliente(
    validation.data.email, 
    validation.data.telefono, 
    validation.data.RFC,
    tiendaId, 
    id
  );
  
  if (duplicados) {
    const err = new Error('Ya existe otro registro con esos datos');
    err.status = 400;
    err.errors = duplicados;
    throw err;
  }

  // 3. Actualización en la base de datos
  const success = await updateClienteById(id, tiendaId, validation.data);
  if (!success) {
    const err = new Error('No se pudo actualizar el cliente (no existe o no tienes permisos)');
    err.status = 404;
    throw err;
  }
  
  return { message: 'Cliente actualizado con éxito' };
};

// ─── ELIMINAR CLIENTE ───
export const removeCliente = async (id, tiendaId) => {
  const success = await deleteClienteById(id, tiendaId);
  if (!success) {
    const err = new Error('No se pudo eliminar el cliente (no existe o no tienes permisos)');
    err.status = 404;
    throw err;
  }
  return { message: 'Cliente eliminado con éxito' };
};
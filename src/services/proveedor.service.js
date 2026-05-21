import { createProveedorSchema, updateProveedorSchema } from '../schemas/proveedor.schema.js';
import * as ProveedorModel from '../models/proveedor.model.js';

export const getProveedoresList = async (tiendaId) => {
  return await ProveedorModel.findAllProveedores(tiendaId);
};

export const getProveedorDetails = async (id, tiendaId) => {
  const proveedor = await ProveedorModel.findProveedorById(id, tiendaId);
  if (!proveedor) {
    const err = new Error('Proveedor no encontrado o no pertenece a tu sucursal');
    err.status = 404;
    throw err;
  }
  return proveedor;
};

export const addProveedor = async (data) => {
  const validation = createProveedorSchema.safeParse(data);
  if (!validation.success) {
    const err = new Error(validation.error.issues?.[0]?.message || 'Datos inválidos');
    err.status = 400;
    throw err;
  }
  const insertId = await ProveedorModel.createProveedor(validation.data);
  return { id_proveedor: insertId, ...validation.data };
};

export const modifyProveedor = async (id, tiendaId, data) => {
  const validation = updateProveedorSchema.safeParse(data);
  if (!validation.success) {
    const err = new Error(validation.error.issues?.[0]?.message || 'Datos inválidos');
    err.status = 400;
    throw err;
  }
  const success = await ProveedorModel.updateProveedorById(id, tiendaId, validation.data);
  if (!success) {
    const err = new Error('No se pudo actualizar el proveedor');
    err.status = 404;
    throw err;
  }
  return { message: 'Proveedor actualizado con éxito' };
};

export const removeProveedor = async (id, tiendaId) => {
  const success = await ProveedorModel.deleteProveedorById(id, tiendaId);
  if (!success) {
    const err = new Error('No se pudo eliminar el proveedor');
    err.status = 404;
    throw err;
  }
  return { message: 'Proveedor eliminado con éxito' };
};
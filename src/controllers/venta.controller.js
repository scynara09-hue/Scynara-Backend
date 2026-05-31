import * as VentaService from '../services/venta.service.js';

export const getAll = async (req, res, next) => {
  try {
    // 💡 Extraemos la tienda del usuario logueado para mostrar solo sus ventas
    const tiendaId = req.user.id_tienda;
    const ventas = await VentaService.getVentasList(tiendaId);

    res.status(200).json(ventas);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tiendaId = req.user.id_tienda;

    // 💡 Filtro de seguridad: asegura que la venta exista y pertenezca a la tienda
    const venta = await VentaService.getVentaDetails(id, tiendaId);

    res.status(200).json(venta);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    // 💡 Ensamblamos el paquete: 
    // Lo que envía el frontend (cliente, total, detalles) + Lo que nos dice el Token (tienda, usuario)
    const ventaData = {
      ...req.body,
      id_tienda: req.user.id_tienda,
      id_usuario: req.user.sub // El 'sub' del JWT es el id_usuario
    };

    const result = await VentaService.addVenta(ventaData);

    res.status(201).json(result);
  } catch (error) {
    // Si el servicio detecta falta de stock u otro error, caerá aquí y el frontend recibirá el 400
    next(error);
  }
};

// ─── CANCELAR VENTA (NUEVO) ───
export const cancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tiendaId = req.user.id_tienda;

    // 💡 Mandamos el ID de la venta y blindamos con el ID de la tienda del token
    const result = await VentaService.cancelVenta(id, tiendaId);

    res.status(200).json(result);
  } catch (error) {
    // Si la venta ya estaba cancelada o no existe, el modelo lanza el error y cae aquí
    next(error);
  }
};
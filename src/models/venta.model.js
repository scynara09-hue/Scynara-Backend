import pool from '../config/db.js';

// 1. Obtener el historial de ventas de una tienda (Incluye quién compró y quién vendió)
export const findAllVentas = async (tiendaId) => {
  const [rows] = await pool.query(`
    SELECT 
      v.id_venta, 
      v.fecha_hora,     
      v.total,
      v.metodo_pago,
      v.estado,         -- 💡 NUEVO: Traemos el estado para saber si fue cancelada
      c.nombre AS cliente_nombre,
      u.nombre AS vendedor_nombre
    FROM Venta v
    JOIN Clientes c ON v.id_cliente = c.id_cliente
    JOIN Usuarios u ON v.id_usuario = u.id_usuario
    WHERE v.id_tienda = ?
    ORDER BY v.id_venta DESC
  `, [tiendaId]);
  return rows;
};

// 2. Obtener una venta específica con sus detalles
export const findVentaCompletaById = async (idVenta, tiendaId) => {
  // Al usar v.* ya nos traemos automáticamente fecha_hora, metodo_pago y estado
  const [ventaRows] = await pool.query(`
    SELECT v.*, c.nombre AS cliente_nombre, u.nombre AS vendedor_nombre 
    FROM Venta v
    JOIN Clientes c ON v.id_cliente = c.id_cliente
    JOIN Usuarios u ON v.id_usuario = u.id_usuario
    WHERE v.id_venta = ? AND v.id_tienda = ?
  `, [idVenta, tiendaId]);

  const venta = ventaRows[0];
  if (!venta) return null;

  const [detalles] = await pool.query(`
    SELECT 
      dv.id_detalle, 
      dv.cantidad, 
      dv.precio_unitario_venta, 
      dv.subtotal,
      p.nombre AS producto_nombre
    FROM Detalle_venta dv
    JOIN Productos p ON dv.id_producto = p.id_producto
    WHERE dv.id_venta = ?
  `, [idVenta]);

  return { ...venta, detalles };
};

// 3. LA TRANSACCIÓN MAESTRA: Crear Venta, Detalles y Restar Stock
export const createVentaTransaccion = async (ventaData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id_tienda, id_cliente, id_usuario, metodo_pago, total, detalles } = ventaData;

    // A. Registrar la Venta (Cabecera)
    const [ventaResult] = await connection.query(
      `INSERT INTO Venta (id_tienda, id_cliente, id_usuario, metodo_pago, total) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_tienda, id_cliente, id_usuario, metodo_pago, total]
    );
    const idVenta = ventaResult.insertId;

    // B. Registrar Detalles y Actualizar Stock iterando sobre el carrito
    for (const item of detalles) {
      const { id_producto, cantidad, precio_unitario_venta } = item;

      // Paso 1: Insertar el detalle
      await connection.query(
        `INSERT INTO Detalle_venta (id_venta, id_producto, cantidad, precio_unitario_venta) 
         VALUES (?, ?, ?, ?)`,
        [idVenta, id_producto, cantidad, precio_unitario_venta]
      );

      // Paso 2: Restar el stock
      const [updateResult] = await connection.query(
        `UPDATE Productos 
         SET cantidad = cantidad - ? 
         WHERE id_producto = ? AND id_tienda = ? AND cantidad >= ?`,
        [cantidad, id_producto, id_tienda, cantidad]
      );

      if (updateResult.affectedRows === 0) {
        const err = new Error(`Stock insuficiente o producto inválido para el ID: ${id_producto}`);
        err.status = 400; 
        throw err;
      }
    }

    await connection.commit();
    return idVenta;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// 4. NUEVO: TRANSACCIÓN PARA CANCELAR VENTA Y RESTAURAR STOCK
export const cancelVentaTransaccion = async (idVenta, tiendaId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Paso 1: Bloqueamos la fila (FOR UPDATE) y verificamos el estado actual
    const [ventaCheck] = await connection.query(
      `SELECT estado FROM Venta WHERE id_venta = ? AND id_tienda = ? FOR UPDATE`,
      [idVenta, tiendaId]
    );

    // Validaciones estrictas de negocio
    if (ventaCheck.length === 0) {
      const err = new Error('La venta no existe o no pertenece a tu sucursal');
      err.status = 404;
      throw err;
    }

    if (ventaCheck[0].estado === 'CANCELADA') {
      const err = new Error('Esta venta ya había sido cancelada previamente');
      err.status = 400;
      throw err;
    }

    // Paso 2: Cambiar el estado de la venta
    await connection.query(
      `UPDATE Venta SET estado = 'CANCELADA' WHERE id_venta = ?`,
      [idVenta]
    );

    // Paso 3: Obtener qué productos (y cuántos) se llevaron en esta venta
    const [detalles] = await connection.query(
      `SELECT id_producto, cantidad FROM Detalle_venta WHERE id_venta = ?`,
      [idVenta]
    );

    // Paso 4: Devolver los productos al inventario
    for (const item of detalles) {
      await connection.query(
        `UPDATE Productos 
         SET cantidad = cantidad + ? 
         WHERE id_producto = ? AND id_tienda = ?`,
        [item.cantidad, item.id_producto, tiendaId]
      );
    }

    // Si todo cuadra, guardamos los cambios de forma permanente
    await connection.commit();
    return true;

  } catch (error) {
    // Si algo falla, revertimos y el inventario queda intacto
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
import pool from '../config/db.js';

// 1. Obtener el historial de ventas de una tienda (Incluye quién compró y quién vendió)
export const findAllVentas = async (tiendaId) => {
  const [rows] = await pool.query(`
    SELECT 
      v.id_venta, 
      v.fecha, 
      v.total,
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
  // Primero buscamos la cabecera para asegurarnos de que pertenece a la tienda
  const [ventaRows] = await pool.query(`
    SELECT v.*, c.nombre AS cliente_nombre, u.nombre AS vendedor_nombre 
    FROM Venta v
    JOIN Clientes c ON v.id_cliente = c.id_cliente
    JOIN Usuarios u ON v.id_usuario = u.id_usuario
    WHERE v.id_venta = ? AND v.id_tienda = ?
  `, [idVenta, tiendaId]);

  const venta = ventaRows[0];
  if (!venta) return null;

  // Luego buscamos sus detalles (los productos que se llevaron)
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

    const { id_tienda, id_cliente, id_usuario, total, detalles } = ventaData;

    // A. Registrar la Venta (Cabecera)
    const [ventaResult] = await connection.query(
      `INSERT INTO Venta (id_tienda, id_cliente, id_usuario, total) VALUES (?, ?, ?, ?)`,
      [id_tienda, id_cliente, id_usuario, total]
    );
    const idVenta = ventaResult.insertId;

    // B. Registrar Detalles y Actualizar Stock iterando sobre el carrito
    for (const item of detalles) {
      const { id_producto, cantidad, precio_unitario_venta } = item;

      // Paso 1: Insertar el detalle de la venta
      await connection.query(
        `INSERT INTO Detalle_venta (id_venta, id_producto, cantidad, precio_unitario_venta) 
         VALUES (?, ?, ?, ?)`,
        [idVenta, id_producto, cantidad, precio_unitario_venta]
      );

      // Paso 2: Restar el stock del producto
      // 💡 NOTA DE SEGURIDAD: El WHERE cantidad >= ? evita que el stock quede en números negativos.
      // También validamos el id_tienda para asegurar que no se descuente stock de otra sucursal.
      const [updateResult] = await connection.query(
        `UPDATE Productos 
         SET cantidad = cantidad - ? 
         WHERE id_producto = ? AND id_tienda = ? AND cantidad >= ?`,
        [cantidad, id_producto, id_tienda, cantidad]
      );

      // Si affectedRows es 0, significa que no había stock suficiente o el producto no pertenece a la tienda
      if (updateResult.affectedRows === 0) {
        throw new Error(`Stock insuficiente o producto inválido para el ID: ${id_producto}`);
      }
    }

    // Si todo salió bien, guardamos permanentemente
    await connection.commit();
    return idVenta;

  } catch (error) {
    // Si ALGO falló, deshacemos todo para evitar inventarios corruptos
    await connection.rollback();
    throw error;
  } finally {
    // Siempre liberamos la conexión de vuelta al pool
    connection.release();
  }
};
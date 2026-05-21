import pool from '../config/db.js';

export const findAllProveedores = async (tiendaId) => {
  const [rows] = await pool.query(
    'SELECT * FROM Proveedores WHERE id_tienda = ? ORDER BY id_proveedor DESC',
    [tiendaId]
  );
  return rows;
};

export const findProveedorById = async (id, tiendaId) => {
  const [rows] = await pool.query(
    'SELECT * FROM Proveedores WHERE id_proveedor = ? AND id_tienda = ?',
    [id, tiendaId]
  );
  return rows[0] || null;
};

export const createProveedor = async (data) => {
  const { id_tienda, nombre, telefono, correo, direccion, tiempo_entregas } = data;
  const [result] = await pool.query(
    `INSERT INTO Proveedores (id_tienda, nombre, telefono, correo, direccion, tiempo_entregas) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id_tienda, nombre, telefono || null, correo || null, direccion || null, tiempo_entregas || null]
  );
  return result.insertId;
};

export const updateProveedorById = async (id, tiendaId, data) => {
  const fields = [];
  const values = [];

  const { nombre, telefono, correo, direccion, tiempo_entregas } = data;

  if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
  if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono); }
  if (correo !== undefined) { fields.push('correo = ?'); values.push(correo); }
  if (direccion !== undefined) { fields.push('direccion = ?'); values.push(direccion); }
  if (tiempo_entregas !== undefined) { fields.push('tiempo_entregas = ?'); values.push(tiempo_entregas); }

  if (fields.length === 0) return true;

  const query = `UPDATE Proveedores SET ${fields.join(', ')} WHERE id_proveedor = ? AND id_tienda = ?`;
  values.push(id, tiendaId);

  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
};

export const deleteProveedorById = async (id, tiendaId) => {
  const [result] = await pool.query('DELETE FROM Proveedores WHERE id_proveedor = ? AND id_tienda = ?', [id, tiendaId]);
  return result.affectedRows > 0;
};
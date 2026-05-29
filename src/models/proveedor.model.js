import pool from '../config/db.js';

export const checkDuplicadosGlobales = async (correo, telefono, tiendaId, excludeId = null) => {
  const fieldErrors = {};

  if (correo) {
    let queryProv = 'SELECT id_proveedor FROM Proveedores WHERE id_tienda = ? AND correo = ?';
    let paramsProv = [tiendaId, correo];
    if (excludeId) { queryProv += ' AND id_proveedor != ?'; paramsProv.push(excludeId); }
    const [provEmail] = await pool.query(queryProv, paramsProv);

    const [userEmail] = await pool.query('SELECT id_usuario FROM Usuarios WHERE correo = ?', [correo]);

    if (provEmail.length > 0) {
      fieldErrors.correo = ["Este correo ya está registrado en otro proveedor de tu sucursal."];
    } else if (userEmail.length > 0) {
      fieldErrors.correo = ["Este correo ya está en uso por un usuario/administrador del sistema."];
    }
  }

  if (telefono) {
    let queryProvTel = 'SELECT id_proveedor FROM Proveedores WHERE id_tienda = ? AND telefono = ?';
    let paramsProvTel = [tiendaId, telefono];
    if (excludeId) { queryProvTel += ' AND id_proveedor != ?'; paramsProvTel.push(excludeId); }
    const [provTel] = await pool.query(queryProvTel, paramsProvTel);
    const [userTel] = await pool.query('SELECT id_usuario FROM Usuarios WHERE telefono = ?', [telefono]);
    if (provTel.length > 0) {
      fieldErrors.telefono = ["Este teléfono ya está registrado en otro proveedor de tu sucursal."];
    } else if (userTel.length > 0) {
      fieldErrors.telefono = ["Este teléfono ya pertenece a un usuario del sistema."];
    }
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
};
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
  // 1. Agregamos 'estado' al destructuring
  const { id_tienda, nombre, telefono, correo, direccion, estado, tiempo_entregas } = data;
  
  // 2. Insertamos el estado. Si viene null/undefined, MySQL usará el DEFAULT 'ACTIVO'
  const [result] = await pool.query(
    `INSERT INTO Proveedores (id_tienda, nombre, telefono, correo, direccion, estado, tiempo_entregas) 
     VALUES (?, ?, ?, ?, ?, COALESCE(?, 'ACTIVO'), ?)`,
    [
      id_tienda, 
      nombre, 
      telefono || null, 
      correo || null, 
      direccion || null, 
      estado || null, 
      tiempo_entregas || null
    ]
  );
  return result.insertId;
};

export const updateProveedorById = async (id, tiendaId, data) => {
  const fields = [];
  const values = [];

  // 1. Agregamos 'estado' al destructuring
  const { nombre, telefono, correo, direccion, estado, tiempo_entregas } = data;

  if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
  if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono); }
  if (correo !== undefined) { fields.push('correo = ?'); values.push(correo); }
  if (direccion !== undefined) { fields.push('direccion = ?'); values.push(direccion); }
  // 2. Agregamos la condición para actualizar el estado
  if (estado !== undefined) { fields.push('estado = ?'); values.push(estado); } 
  if (tiempo_entregas !== undefined) { fields.push('tiempo_entregas = ?'); values.push(tiempo_entregas); }

  if (fields.length === 0) return true;

  const query = `UPDATE Proveedores SET ${fields.join(', ')} WHERE id_proveedor = ? AND id_tienda = ?`;
  values.push(id, tiendaId);

  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
};

export const deleteProveedorById = async (id, tiendaId) => {
  // 1. CAMBIO CRÍTICO: Transformamos el Hard Delete en un Soft Delete.
  const [result] = await pool.query(
    "UPDATE Proveedores SET estado = 'INACTIVO' WHERE id_proveedor = ? AND id_tienda = ?", 
    [id, tiendaId]
  );
  return result.affectedRows > 0;
};

// Opcional: Por si en algún momento necesitas una función para borrar el registro de verdad
export const hardDeleteProveedorById = async (id, tiendaId) => {
  const [result] = await pool.query(
    'DELETE FROM Proveedores WHERE id_proveedor = ? AND id_tienda = ?', 
    [id, tiendaId]
  );
  return result.affectedRows > 0;
};
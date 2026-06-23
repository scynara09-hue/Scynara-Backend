import pool from "../src/config/db.js";
import { hashPassword } from "../src/utils/hash.js";

const TEST_USERS = {
  admin: {
    nombre: "Administrador General",
    telefono: "5551234567",
    correo: "admin@scynara.com",
    password: "aAdmin1234!",
    rol: "ADMINISTRADOR",
  },
  guest: {
    nombre: "Usuario Invitado",
    telefono: "5559876543",
    correo: "invitado@scynara.com",
    password: "Invitado1234!",
    rol: "INVITADO",
  },
};

const upsertUser = async (connection, user, tiendaId) => {
  const hashedPassword = await hashPassword(user.password);
  const [result] = await connection.query(
    `INSERT INTO Usuarios
      (id_tienda, nombre, telefono, correo, contrasena, rol, estado)
     VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')
     ON DUPLICATE KEY UPDATE
       id_usuario = LAST_INSERT_ID(id_usuario),
       id_tienda = VALUES(id_tienda),
       nombre = VALUES(nombre),
       telefono = VALUES(telefono),
       contrasena = VALUES(contrasena),
       rol = VALUES(rol),
       estado = 'ACTIVO'`,
    [
      tiendaId,
      user.nombre,
      user.telefono,
      user.correo,
      hashedPassword,
      user.rol,
    ]
  );

  return result.insertId;
};

const seedTestUsers = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [stores] = await connection.query(
      "SELECT id_tienda FROM Tiendas WHERE nombre = ? LIMIT 1",
      ["Scynara Demo"]
    );

    let tiendaId = stores[0]?.id_tienda;

    if (!tiendaId) {
      const [storeResult] = await connection.query(
        "INSERT INTO Tiendas (nombre, direccion) VALUES (?, ?)",
        ["Scynara Demo", "Sucursal de prueba"]
      );
      tiendaId = storeResult.insertId;
    }

    const adminId = await upsertUser(connection, TEST_USERS.admin, tiendaId);

    await connection.query("DELETE FROM Empleado WHERE id_usuario = ?", [
      adminId,
    ]);
    await connection.query(
      `INSERT INTO Administrador
        (id_usuario, id_admin_padre, nivel_acceso, permisos)
       VALUES (?, NULL, 'TOTAL', 'ACCESO_GENERAL')
       ON DUPLICATE KEY UPDATE
         id_admin_padre = NULL,
         nivel_acceso = 'TOTAL',
         permisos = 'ACCESO_GENERAL'`,
      [adminId]
    );

    const [[admin]] = await connection.query(
      "SELECT id_admin FROM Administrador WHERE id_usuario = ?",
      [adminId]
    );

    const guestId = await upsertUser(connection, TEST_USERS.guest, tiendaId);

    await connection.query("DELETE FROM Administrador WHERE id_usuario = ?", [
      guestId,
    ]);
    await connection.query(
      `INSERT INTO Empleado
        (id_usuario, id_admin_creador, tipo_jornada, horario_entrada, horario_salida)
       VALUES (?, ?, 'Completa', '08:00:00', '16:00:00')
       ON DUPLICATE KEY UPDATE
         id_admin_creador = VALUES(id_admin_creador),
         tipo_jornada = 'Completa',
         horario_entrada = '08:00:00',
         horario_salida = '16:00:00'`,
      [guestId, admin.id_admin]
    );

    await connection.commit();

    console.log("Usuarios de prueba creados o actualizados correctamente.");
    console.log(`Tienda: Scynara Demo (ID ${tiendaId})`);
    console.log(`Administrador: ${TEST_USERS.admin.correo}`);
    console.log(`Invitado: ${TEST_USERS.guest.correo}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};

seedTestUsers().catch((error) => {
  console.error("No se pudieron crear los usuarios de prueba:", error.message);
  process.exitCode = 1;
});

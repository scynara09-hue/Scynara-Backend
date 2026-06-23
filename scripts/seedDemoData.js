import pool from "../src/config/db.js";
import { hashPassword } from "../src/utils/hash.js";

const STORE_NAME = "Scynara Demo";

const employees = [
  {
    nombre: "Mariana López",
    telefono: "5552103487",
    correo: "mariana.lopez@scynara.com",
    password: "Mariana1234!",
    tipo_jornada: "Completa",
    entrada: "08:00:00",
    salida: "16:00:00",
  },
  {
    nombre: "Carlos Mendoza",
    telefono: "5553748216",
    correo: "carlos.mendoza@scynara.com",
    password: "Carlos1234!",
    tipo_jornada: "Medio",
    entrada: "14:00:00",
    salida: "20:00:00",
  },
];

const clients = [
  ["Ana Martínez", "Av. Universidad 120, CDMX", "5512347801", "ana.martinez@email.com", "MARA920315AB2"],
  ["Roberto Sánchez", "Calle Fresno 45, CDMX", "5512347802", "roberto.sanchez@email.com", "SARR850724K91"],
  ["Lucía Hernández", "Insurgentes Sur 830, CDMX", "5512347803", "lucia.hernandez@email.com", "HEGL940611P37"],
  ["Diego Ramírez", "Río Lerma 210, CDMX", "5512347804", "diego.ramirez@email.com", "RARD880902LM4"],
  ["Fernanda Torres", "Calz. de Tlalpan 1550, CDMX", "5512347805", "fernanda.torres@email.com", "TOFE960128JH8"],
  ["Jorge Castillo", "Av. Coyoacán 330, CDMX", "5512347806", "jorge.castillo@email.com", "CAGJ8104177N2"],
  ["Sofía Navarro", "Eje Central 711, CDMX", "5512347807", "sofia.navarro@email.com", "NASO930805QA6"],
  ["Público General", "Sucursal Scynara Demo", "5512347899", "publico@scynara.com", null],
];

const providers = [
  ["Distribuidora La Paloma", "5551002001", "ventas@lapaloma.mx", "Central de Abasto, Iztapalapa", "24 a 48 horas", "Abarrotes"],
  ["Bebidas del Centro", "5551002002", "pedidos@bebidascentro.mx", "Vallejo, Azcapotzalco", "24 horas", "Bebidas"],
  ["Lácteos del Valle", "5551002003", "contacto@lacteosvalle.mx", "Tlalnepantla, Estado de México", "Mismo día", "Lácteos"],
  ["Hogar Limpio MX", "5551002004", "ventas@hogarlimpio.mx", "Naucalpan, Estado de México", "2 a 3 días", "Limpieza"],
  ["Mascotas Felices", "5551002005", "mayoreo@mascotasfelices.mx", "Iztacalco, CDMX", "48 horas", "Mascotas"],
];

const products = [
  ["Arroz Morelos 1 kg", 34, 320, 28, null, "Abarrotes", "Distribuidora La Paloma"],
  ["Frijol negro 1 kg", 22, 390, 35, null, "Abarrotes", "Distribuidora La Paloma"],
  ["Aceite vegetal 900 ml", 18, 510, 48, null, "Abarrotes", "Distribuidora La Paloma"],
  ["Atún en agua 140 g", 5, 410, 24, null, "Abarrotes", "Distribuidora La Paloma"],
  ["Refresco cola 600 ml", 46, 290, 18, null, "Bebidas", "Bebidas del Centro"],
  ["Agua mineral 1 l", 27, 210, 16, null, "Bebidas", "Bebidas del Centro"],
  ["Jugo de naranja 1 l", 12, 360, 32, 12, "Bebidas", "Bebidas del Centro"],
  ["Leche entera 1 l", 20, 265, 27, 9, "Lácteos", "Lácteos del Valle"],
  ["Yogur natural 1 kg", 4, 420, 46, 18, "Lácteos", "Lácteos del Valle"],
  ["Queso panela 400 g", 8, 680, 72, 25, "Lácteos", "Lácteos del Valle"],
  ["Detergente líquido 1 l", 15, 540, 58, null, "Limpieza", "Hogar Limpio MX"],
  ["Cloro 1 l", 3, 180, 19, null, "Limpieza", "Hogar Limpio MX"],
  ["Alimento para perro 2 kg", 11, 890, 98, null, "Mascotas", "Mascotas Felices"],
  ["Arena para gato 5 kg", 7, 760, 85, null, "Mascotas", "Mascotas Felices"],
];

// Se insertan de la venta más antigua a la más reciente.
const sales = [
  { days: 21, hours: 2, client: 0, seller: 0, method: "TARJETA", items: [[0, 2], [4, 3], [7, 2]] },
  { days: 18, hours: 1, client: 1, seller: 1, method: "EFECTIVO", items: [[1, 2], [2, 1], [10, 1]] },
  { days: 14, hours: 3, client: 2, seller: 0, method: "TRANSFERENCIA", items: [[6, 2], [8, 1], [9, 1]] },
  { days: 10, hours: 4, client: 3, seller: 1, method: "TARJETA", items: [[12, 1], [13, 1], [5, 2]] },
  { days: 7, hours: 2, client: 4, seller: 0, method: "EFECTIVO", items: [[0, 1], [3, 4], [4, 2]] },
  { days: 5, hours: 5, client: 5, seller: 1, method: "TRANSFERENCIA", items: [[2, 2], [7, 3], [11, 2]] },
  { days: 3, hours: 1, client: 6, seller: 0, method: "TARJETA", items: [[1, 1], [6, 1], [10, 2]] },
  { days: 1, hours: 3, client: 7, seller: 1, method: "EFECTIVO", items: [[4, 4], [5, 2], [3, 2]] },
  { days: 0, hours: 5, client: 0, seller: 0, method: "TARJETA", items: [[0, 1], [2, 1], [7, 2]] },
  { days: 0, hours: 3, client: 2, seller: 1, method: "EFECTIVO", items: [[4, 3], [8, 1], [11, 1]] },
  { days: 0, hours: 1, client: 4, seller: 0, method: "TRANSFERENCIA", items: [[9, 1], [10, 1], [12, 1]] },
  { days: 0, hours: 0, client: 7, seller: 1, method: "EFECTIVO", items: [[1, 1], [4, 2], [5, 1]], cancelled: true },
];

const insertEmployee = async (connection, employee, tiendaId, adminId) => {
  const password = await hashPassword(employee.password);
  const [result] = await connection.query(
    `INSERT INTO Usuarios
      (id_tienda, nombre, telefono, correo, contrasena, rol, estado)
     VALUES (?, ?, ?, ?, ?, 'EMPLEADO', 'ACTIVO')`,
    [tiendaId, employee.nombre, employee.telefono, employee.correo, password]
  );

  await connection.query(
    `INSERT INTO Empleado
      (id_usuario, id_admin_creador, tipo_jornada, horario_entrada, horario_salida)
     VALUES (?, ?, ?, ?, ?)`,
    [
      result.insertId,
      adminId,
      employee.tipo_jornada,
      employee.entrada,
      employee.salida,
    ]
  );

  return result.insertId;
};

const seedDemoData = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[store]] = await connection.query(
      "SELECT id_tienda FROM Tiendas WHERE nombre = ? LIMIT 1",
      [STORE_NAME]
    );

    if (!store) {
      throw new Error("Primero ejecuta `pnpm seed` para crear Scynara Demo.");
    }

    const tiendaId = store.id_tienda;
    const [[admin]] = await connection.query(
      `SELECT a.id_admin, u.id_usuario
       FROM Administrador a
       INNER JOIN Usuarios u ON u.id_usuario = a.id_usuario
       WHERE u.id_tienda = ? AND u.correo = 'admin@scynara.com'
       LIMIT 1`,
      [tiendaId]
    );

    if (!admin) {
      throw new Error("No se encontró el administrador general de la tienda demo.");
    }

    // Refresca únicamente la información perteneciente a la tienda demo.
    await connection.query(
      `DELETE e FROM Evaluaciones e
       INNER JOIN Usuarios u ON u.id_usuario = e.id_usuario
       WHERE u.id_tienda = ?`,
      [tiendaId]
    );
    await connection.query(
      `DELETE dv FROM Detalle_venta dv
       INNER JOIN Venta v ON v.id_venta = dv.id_venta
       WHERE v.id_tienda = ?`,
      [tiendaId]
    );
    await connection.query("DELETE FROM Venta WHERE id_tienda = ?", [tiendaId]);
    await connection.query("DELETE FROM Productos WHERE id_tienda = ?", [tiendaId]);
    await connection.query("DELETE FROM Proveedores WHERE id_tienda = ?", [tiendaId]);
    await connection.query("DELETE FROM Clientes WHERE id_tienda = ?", [tiendaId]);

    const employeeEmails = employees.map((employee) => employee.correo);
    await connection.query(
      `DELETE e FROM Empleado e
       INNER JOIN Usuarios u ON u.id_usuario = e.id_usuario
       WHERE u.id_tienda = ? AND u.correo IN (?, ?)`,
      [tiendaId, ...employeeEmails]
    );
    await connection.query(
      "DELETE FROM Usuarios WHERE id_tienda = ? AND correo IN (?, ?)",
      [tiendaId, ...employeeEmails]
    );

    const employeeIds = [];
    for (const employee of employees) {
      employeeIds.push(
        await insertEmployee(connection, employee, tiendaId, admin.id_admin)
      );
    }

    await connection.query(
      `INSERT IGNORE INTO Categoria (categoria) VALUES
       ('Abarrotes'), ('Bebidas'), ('Lácteos'), ('Limpieza'), ('Mascotas'), ('Otros')`
    );
    const [categoryRows] = await connection.query(
      "SELECT id_categoria, categoria FROM Categoria"
    );
    const categoryIds = Object.fromEntries(
      categoryRows.map((category) => [category.categoria, category.id_categoria])
    );

    const providerIds = {};
    for (const provider of providers) {
      const [result] = await connection.query(
        `INSERT INTO Proveedores
          (id_tienda, id_categoria, nombre, telefono, correo, direccion, estado, tiempo_entregas)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO', ?)`,
        [
          tiendaId,
          categoryIds[provider[5]],
          provider[0],
          provider[1],
          provider[2],
          provider[3],
          provider[4],
        ]
      );
      providerIds[provider[0]] = result.insertId;
    }

    const clientIds = [];
    for (const client of clients) {
      const [result] = await connection.query(
        `INSERT INTO Clientes
          (id_tienda, nombre, direccion, telefono, correo, RFC)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tiendaId, ...client]
      );
      clientIds.push(result.insertId);
    }

    const productRecords = [];
    for (const product of products) {
      const expiryDate = product[4]
        ? new Date(Date.now() + product[4] * 86400000)
            .toISOString()
            .slice(0, 10)
        : null;
      const [result] = await connection.query(
        `INSERT INTO Productos
          (id_tienda, id_proveedor, id_categoria, nombre, cantidad,
           precio_caja, precio_unitario, fecha_caducidad)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tiendaId,
          providerIds[product[6]],
          categoryIds[product[5]],
          product[0],
          product[1],
          product[2],
          product[3],
          expiryDate,
        ]
      );
      productRecords.push({ id: result.insertId, price: product[3] });
    }

    for (const sale of sales) {
      const total = sale.items.reduce(
        (sum, [index, quantity]) =>
          sum + Number(productRecords[index].price) * quantity,
        0
      );
      const [saleResult] = await connection.query(
        `INSERT INTO Venta
          (id_tienda, id_cliente, id_usuario, metodo_pago, total, estado, fecha_hora)
         VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(DATE_SUB(NOW(), INTERVAL ? DAY), INTERVAL ? HOUR))`,
        [
          tiendaId,
          clientIds[sale.client],
          employeeIds[sale.seller],
          sale.method,
          total,
          sale.cancelled ? "CANCELADA" : "COMPLETADA",
          sale.days,
          sale.hours,
        ]
      );

      for (const [productIndex, quantity] of sale.items) {
        await connection.query(
          `INSERT INTO Detalle_venta
            (id_venta, id_producto, cantidad, precio_unitario_venta)
           VALUES (?, ?, ?, ?)`,
          [
            saleResult.insertId,
            productRecords[productIndex].id,
            quantity,
            productRecords[productIndex].price,
          ]
        );
      }
    }

    const evaluationAuthors = [
      admin.id_usuario,
      employeeIds[0],
      employeeIds[1],
    ];
    const evaluations = [
      [evaluationAuthors[0], 5, "La plataforma permite revisar la operación diaria de forma clara.", "APROBADA"],
      [evaluationAuthors[1], 5, "El registro de ventas es rápido y el inventario se actualiza fácilmente.", "APROBADA"],
      [evaluationAuthors[2], 4, "Los módulos principales son sencillos de aprender y utilizar.", "APROBADA"],
      [evaluationAuthors[1], 4, "Los avisos de existencias bajas ayudan a preparar los pedidos.", "APROBADA"],
    ];
    for (const evaluation of evaluations) {
      await connection.query(
        `INSERT INTO Evaluaciones
          (id_usuario, calificacion, comentario, estado, fecha_creacion)
         VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 2 DAY))`,
        evaluation
      );
    }

    await connection.commit();

    console.log("Flujo demo creado correctamente.");
    console.log(
      `Resumen: ${employees.length} empleados, ${clients.length} clientes, ` +
        `${providers.length} proveedores, ${products.length} productos y ${sales.length} ventas.`
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};

seedDemoData().catch((error) => {
  console.error("No se pudo crear el flujo demo:", error.message);
  process.exitCode = 1;
});

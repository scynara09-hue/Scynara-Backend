const API_URL = (
  process.env.API_URL || "https://web-production-8bf2b.up.railway.app"
).replace(/\/+$/, "");

const request = async (path, { token, method = "GET", body } = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `${method} ${path}: ${data.message || data.error || response.status}`
    );
  }

  return data;
};

const login = async (email, password) =>
  request("/auth/login", { method: "POST", body: { email, password } });

const run = async () => {
  const adminSession = await login("admin@scynara.com", "aAdmin1234!");
  const adminToken = adminSession.token;

  const users = await request("/auth/users", { token: adminToken });
  const employeeInputs = [
    {
      nombre: "Mariana",
      apellidos: "López",
      telefono: "5552103487",
      email: "mariana.lopez@scynara.com",
      password: "Mariana1234!",
      rol: "EMPLEADO",
      estado: "ACTIVO",
      tipo_jornada: "Completa",
      horario_entrada: "08:00",
      horario_salida: "16:00",
    },
    {
      nombre: "Carlos",
      apellidos: "Mendoza",
      telefono: "5553748216",
      email: "carlos.mendoza@scynara.com",
      password: "Carlos1234!",
      rol: "EMPLEADO",
      estado: "ACTIVO",
      tipo_jornada: "Medio",
      horario_entrada: "14:00",
      horario_salida: "20:00",
    },
  ];

  for (const employee of employeeInputs) {
    if (!users.some((user) => user.correo === employee.email)) {
      await request("/auth/users", {
        token: adminToken,
        method: "POST",
        body: employee,
      });
    }
  }

  const categories = await request("/proveedores/categorias", {
    token: adminToken,
  });
  const categoryIds = Object.fromEntries(
    categories.map((category) => [category.categoria, category.id_categoria])
  );

  const providerInputs = [
    ["Distribuidora La Paloma", "5551002001", "ventas@lapaloma.mx", "Central de Abasto, Iztapalapa", "24 a 48 horas", "Abarrotes"],
    ["Bebidas del Centro", "5551002002", "pedidos@bebidascentro.mx", "Vallejo, Azcapotzalco", "24 horas", "Bebidas"],
    ["Lácteos del Valle", "5551002003", "contacto@lacteosvalle.mx", "Tlalnepantla, Estado de México", "Mismo día", "Lácteos"],
    ["Hogar Limpio MX", "5551002004", "ventas@hogarlimpio.mx", "Naucalpan, Estado de México", "2 a 3 días", "Limpieza"],
    ["Mascotas Felices", "5551002005", "mayoreo@mascotasfelices.mx", "Iztacalco, CDMX", "48 horas", "Mascotas"],
  ];
  let providers = await request("/proveedores", { token: adminToken });

  for (const provider of providerInputs) {
    if (!providers.some((item) => item.nombre === provider[0])) {
      await request("/proveedores", {
        token: adminToken,
        method: "POST",
        body: {
          nombre: provider[0],
          telefono: provider[1],
          correo: provider[2],
          direccion: provider[3],
          tiempo_entregas: provider[4],
          id_categoria: categoryIds[provider[5]],
          estado: "ACTIVO",
        },
      });
    }
  }
  providers = await request("/proveedores", { token: adminToken });
  const providerIds = Object.fromEntries(
    providers.map((provider) => [provider.nombre, provider.id_proveedor])
  );

  const clientInputs = [
    ["Ana Martínez", "Av. Universidad 120, CDMX", "5512347801", "ana.martinez@email.com"],
    ["Roberto Sánchez", "Calle Fresno 45, CDMX", "5512347802", "roberto.sanchez@email.com"],
    ["Lucía Hernández", "Insurgentes Sur 830, CDMX", "5512347803", "lucia.hernandez@email.com"],
    ["Diego Ramírez", "Río Lerma 210, CDMX", "5512347804", "diego.ramirez@email.com"],
    ["Fernanda Torres", "Calz. de Tlalpan 1550, CDMX", "5512347805", "fernanda.torres@email.com"],
    ["Jorge Castillo", "Av. Coyoacán 330, CDMX", "5512347806", "jorge.castillo@email.com"],
    ["Sofía Navarro", "Eje Central 711, CDMX", "5512347807", "sofia.navarro@email.com"],
    ["Público General", "Sucursal Scynara Demo", "5512347899", "publico@scynara.com"],
  ];
  let clients = await request("/clientes", { token: adminToken });

  for (const client of clientInputs) {
    if (!clients.some((item) => item.correo === client[3])) {
      await request("/clientes", {
        token: adminToken,
        method: "POST",
        body: {
          nombre: client[0],
          direccion: client[1],
          telefono: client[2],
          email: client[3],
          RFC: null,
        },
      });
    }
  }
  clients = await request("/clientes", { token: adminToken });
  const clientIds = Object.fromEntries(
    clients.map((client) => [client.nombre, client.id_cliente])
  );

  const futureDate = (days) =>
    new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  const productInputs = [
    ["Arroz Morelos 1 kg", 40, 320, 28, null, "Abarrotes", "Distribuidora La Paloma"],
    ["Frijol negro 1 kg", 28, 390, 35, null, "Abarrotes", "Distribuidora La Paloma"],
    ["Aceite vegetal 900 ml", 24, 510, 48, null, "Abarrotes", "Distribuidora La Paloma"],
    ["Atún en agua 140 g", 9, 410, 24, null, "Abarrotes", "Distribuidora La Paloma"],
    ["Refresco cola 600 ml", 55, 290, 18, null, "Bebidas", "Bebidas del Centro"],
    ["Agua mineral 1 l", 35, 210, 16, null, "Bebidas", "Bebidas del Centro"],
    ["Jugo de naranja 1 l", 15, 360, 32, futureDate(12), "Bebidas", "Bebidas del Centro"],
    ["Leche entera 1 l", 30, 265, 27, futureDate(9), "Lácteos", "Lácteos del Valle"],
    ["Yogur natural 1 kg", 6, 420, 46, futureDate(18), "Lácteos", "Lácteos del Valle"],
    ["Queso panela 400 g", 10, 680, 72, futureDate(25), "Lácteos", "Lácteos del Valle"],
    ["Detergente líquido 1 l", 20, 540, 58, null, "Limpieza", "Hogar Limpio MX"],
    ["Cloro 1 l", 5, 180, 19, null, "Limpieza", "Hogar Limpio MX"],
    ["Alimento para perro 2 kg", 14, 890, 98, null, "Mascotas", "Mascotas Felices"],
    ["Arena para gato 5 kg", 10, 760, 85, null, "Mascotas", "Mascotas Felices"],
  ];
  let products = await request("/products", { token: adminToken });

  for (const product of productInputs) {
    if (!products.some((item) => item.nombre === product[0])) {
      await request("/products", {
        token: adminToken,
        method: "POST",
        body: {
          nombre: product[0],
          cantidad: product[1],
          precio_caja: product[2],
          precio_unitario: product[3],
          fecha_caducidad: product[4],
          id_categoria: categoryIds[product[5]],
          id_proveedor: providerIds[product[6]],
        },
      });
    }
  }
  products = await request("/products", { token: adminToken });
  const productMap = Object.fromEntries(
    products.map((product) => [product.nombre, product])
  );

  const existingSales = await request("/ventas", { token: adminToken });
  if (existingSales.length === 0) {
    const mariana = await login(
      "mariana.lopez@scynara.com",
      "Mariana1234!"
    );
    const carlos = await login(
      "carlos.mendoza@scynara.com",
      "Carlos1234!"
    );
    const saleInputs = [
      [mariana.token, "Ana Martínez", "TARJETA", [["Arroz Morelos 1 kg", 2], ["Refresco cola 600 ml", 3], ["Leche entera 1 l", 2]]],
      [carlos.token, "Roberto Sánchez", "EFECTIVO", [["Frijol negro 1 kg", 2], ["Aceite vegetal 900 ml", 1], ["Detergente líquido 1 l", 1]]],
      [mariana.token, "Lucía Hernández", "TRANSFERENCIA", [["Jugo de naranja 1 l", 2], ["Yogur natural 1 kg", 1], ["Queso panela 400 g", 1]]],
      [carlos.token, "Diego Ramírez", "TARJETA", [["Alimento para perro 2 kg", 1], ["Arena para gato 5 kg", 1], ["Agua mineral 1 l", 2]]],
      [mariana.token, "Fernanda Torres", "EFECTIVO", [["Atún en agua 140 g", 3], ["Refresco cola 600 ml", 2], ["Arroz Morelos 1 kg", 1]]],
      [carlos.token, "Jorge Castillo", "TRANSFERENCIA", [["Aceite vegetal 900 ml", 2], ["Leche entera 1 l", 3], ["Cloro 1 l", 1]]],
      [mariana.token, "Sofía Navarro", "TARJETA", [["Frijol negro 1 kg", 1], ["Jugo de naranja 1 l", 1], ["Detergente líquido 1 l", 2]]],
      [carlos.token, "Público General", "EFECTIVO", [["Refresco cola 600 ml", 4], ["Agua mineral 1 l", 2], ["Atún en agua 140 g", 2]]],
    ];

    for (const sale of saleInputs) {
      const details = sale[3].map(([name, quantity]) => ({
        id_producto: productMap[name].id_producto,
        cantidad: quantity,
        precio_unitario_venta: Number(productMap[name].precio_unitario),
      }));
      const total = details.reduce(
        (sum, item) => sum + item.cantidad * item.precio_unitario_venta,
        0
      );
      await request("/ventas", {
        token: sale[0],
        method: "POST",
        body: {
          id_cliente: clientIds[sale[1]],
          metodo_pago: sale[2],
          total,
          detalles: details,
        },
      });
    }
  }

  const summary = {
    users: (await request("/auth/users", { token: adminToken })).length,
    clients: (await request("/clientes", { token: adminToken })).length,
    providers: (await request("/proveedores", { token: adminToken })).length,
    products: (await request("/products", { token: adminToken })).length,
    sales: (await request("/ventas", { token: adminToken })).length,
  };
  console.log("Flujo demo cargado mediante la API:", summary);
};

run().catch((error) => {
  console.error("No se pudo cargar el flujo demo:", error.message);
  process.exitCode = 1;
});

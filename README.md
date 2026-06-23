# Scynara — Backend

Este repositorio contiene el servidor de Scynara, un proyecto escolar para llevar el control básico de una tienda. Su función es conectar la aplicación web con la base de datos y atender operaciones como el inicio de sesión, el inventario, los clientes, los proveedores y las ventas.

Repositorio central del proyecto: [DB-Coursework-2026-2](https://github.com/gabrielhuav/DB-Coursework-2026-2.git)

## ¿Qué se puede hacer?

- Iniciar sesión y administrar usuarios.
- Registrar, consultar, editar y eliminar productos.
- Llevar el control de clientes y proveedores.
- Registrar ventas y descontar los productos vendidos del inventario.
- Consultar el historial y detalle de las ventas.
- Registrar evaluaciones.
- Separar la información por tienda y limitar algunas acciones según el usuario.

## Herramientas utilizadas

El servidor está hecho con Node.js y Express. La información se guarda en MySQL y las sesiones se manejan mediante tokens. También se incluyen validaciones para evitar que lleguen datos incompletos o con un formato incorrecto.

## Antes de comenzar

Es necesario tener instalado:

- Node.js
- pnpm
- MySQL
- La base de datos de Scynara creada y lista para usarse

## Configuración

1. Instala las dependencias:

```bash
pnpm install
```

2. Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=scynara

JWT_SECRET=escribe_una_clave_segura
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

Si se utiliza una base de datos alojada en línea, también se puede configurar `MYSQL_PUBLIC_URL` en lugar de los datos de conexión separados.

## Ejecutar el proyecto

Durante el desarrollo:

```bash
pnpm dev
```

Para iniciarlo normalmente:

```bash
pnpm start
```

Cuando la conexión sea correcta, el servidor estará disponible en `http://localhost:3000`. Al abrir esa dirección debe aparecer un mensaje indicando que la API está funcionando.

## Organización general

El código se encuentra dentro de `src`. Las rutas reciben las solicitudes, los controladores y servicios procesan las acciones, y los modelos se comunican con MySQL. En la carpeta `scripts` hay una utilidad para insertar un usuario inicial.

## Estado del proyecto

Scynara sigue en desarrollo. Las funciones principales ya están conectadas, aunque todavía pueden existir apartados incompletos, cambios pendientes y casos que necesiten más pruebas.

-- Esquema que utiliza la versión actual del backend de Scynara.
-- ATENCIÓN: elimina las tablas existentes. Úsese solamente en una base vacía
-- o después de crear un respaldo.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Historial_Inventario;
DROP TABLE IF EXISTS Producto_Categoria;
DROP TABLE IF EXISTS Proveedor_Categoria;
DROP TABLE IF EXISTS Detalle_Venta;
DROP TABLE IF EXISTS Detalle_venta;
DROP TABLE IF EXISTS Venta;
DROP TABLE IF EXISTS Evaluaciones;
DROP TABLE IF EXISTS Productos;
DROP TABLE IF EXISTS Proveedores;
DROP TABLE IF EXISTS Clientes;
DROP TABLE IF EXISTS Empleado;
DROP TABLE IF EXISTS Administrador;
DROP TABLE IF EXISTS Categorias;
DROP TABLE IF EXISTS Categoria;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Tiendas;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Tiendas (
  id_tienda INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(150) DEFAULT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_tienda)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Usuarios (
  id_usuario INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tienda INT UNSIGNED DEFAULT NULL,
  nombre VARCHAR(101) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('ADMINISTRADOR', 'EMPLEADO', 'INVITADO') NOT NULL,
  estado ENUM('ACTIVO', 'INACTIVO', 'BAJA') NOT NULL DEFAULT 'ACTIVO',
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_correo (correo),
  UNIQUE KEY uq_usuarios_telefono (telefono),
  KEY idx_usuarios_tienda (id_tienda),
  CONSTRAINT fk_usuarios_tienda
    FOREIGN KEY (id_tienda) REFERENCES Tiendas (id_tienda)
    ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Administrador (
  id_admin INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL,
  id_admin_padre INT UNSIGNED DEFAULT NULL,
  nivel_acceso ENUM('BASICO', 'AVANZADO', 'TOTAL') NOT NULL DEFAULT 'BASICO',
  permisos TEXT NOT NULL,
  PRIMARY KEY (id_admin),
  UNIQUE KEY uq_administrador_usuario (id_usuario),
  KEY idx_administrador_padre (id_admin_padre),
  CONSTRAINT fk_administrador_usuario
    FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
    ON DELETE CASCADE,
  CONSTRAINT fk_administrador_padre
    FOREIGN KEY (id_admin_padre) REFERENCES Administrador (id_admin)
    ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Empleado (
  id_empleado INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL,
  id_admin_creador INT UNSIGNED DEFAULT NULL,
  tipo_jornada ENUM('Completa', 'Medio') NOT NULL DEFAULT 'Completa',
  horario_entrada TIME NOT NULL DEFAULT '08:00:00',
  horario_salida TIME NOT NULL DEFAULT '16:00:00',
  PRIMARY KEY (id_empleado),
  UNIQUE KEY uq_empleado_usuario (id_usuario),
  KEY idx_empleado_admin (id_admin_creador),
  CONSTRAINT fk_empleado_usuario
    FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
    ON DELETE CASCADE,
  CONSTRAINT fk_empleado_admin
    FOREIGN KEY (id_admin_creador) REFERENCES Administrador (id_admin)
    ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Categoria (
  id_categoria INT UNSIGNED NOT NULL AUTO_INCREMENT,
  categoria VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uq_categoria_nombre (categoria)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Proveedores (
  id_proveedor INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tienda INT UNSIGNED NOT NULL,
  id_categoria INT UNSIGNED DEFAULT NULL,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  correo VARCHAR(100) DEFAULT NULL,
  direccion VARCHAR(150) DEFAULT NULL,
  estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  tiempo_entregas VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (id_proveedor),
  KEY idx_proveedores_tienda (id_tienda),
  KEY idx_proveedores_categoria (id_categoria),
  CONSTRAINT fk_proveedores_tienda
    FOREIGN KEY (id_tienda) REFERENCES Tiendas (id_tienda)
    ON DELETE CASCADE,
  CONSTRAINT fk_proveedores_categoria
    FOREIGN KEY (id_categoria) REFERENCES Categoria (id_categoria)
    ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Clientes (
  id_cliente INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tienda INT UNSIGNED NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(150) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  RFC VARCHAR(13) DEFAULT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cliente),
  UNIQUE KEY uq_clientes_correo (correo),
  UNIQUE KEY uq_clientes_telefono (telefono),
  UNIQUE KEY uq_clientes_rfc (RFC),
  KEY idx_clientes_tienda (id_tienda),
  CONSTRAINT fk_clientes_tienda
    FOREIGN KEY (id_tienda) REFERENCES Tiendas (id_tienda)
    ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Productos (
  id_producto INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tienda INT UNSIGNED NOT NULL,
  id_proveedor INT UNSIGNED DEFAULT NULL,
  id_categoria INT UNSIGNED DEFAULT NULL,
  nombre VARCHAR(100) NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 0,
  precio_caja DECIMAL(10, 2) NOT NULL DEFAULT 0,
  precio_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
  fecha_caducidad DATE DEFAULT NULL,
  PRIMARY KEY (id_producto),
  KEY idx_productos_tienda (id_tienda),
  KEY idx_productos_proveedor (id_proveedor),
  KEY idx_productos_categoria (id_categoria),
  CONSTRAINT fk_productos_tienda
    FOREIGN KEY (id_tienda) REFERENCES Tiendas (id_tienda)
    ON DELETE CASCADE,
  CONSTRAINT fk_productos_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores (id_proveedor)
    ON DELETE SET NULL,
  CONSTRAINT fk_productos_categoria
    FOREIGN KEY (id_categoria) REFERENCES Categoria (id_categoria)
    ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Venta (
  id_venta INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tienda INT UNSIGNED NOT NULL,
  id_cliente INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  metodo_pago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA') NOT NULL,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estado ENUM('COMPLETADA', 'CANCELADA') NOT NULL DEFAULT 'COMPLETADA',
  fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_venta),
  KEY idx_venta_tienda (id_tienda),
  KEY idx_venta_cliente (id_cliente),
  KEY idx_venta_usuario (id_usuario),
  CONSTRAINT fk_venta_tienda
    FOREIGN KEY (id_tienda) REFERENCES Tiendas (id_tienda)
    ON DELETE CASCADE,
  CONSTRAINT fk_venta_cliente
    FOREIGN KEY (id_cliente) REFERENCES Clientes (id_cliente),
  CONSTRAINT fk_venta_usuario
    FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Detalle_venta (
  id_detalle INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_venta INT UNSIGNED NOT NULL,
  id_producto INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL,
  precio_unitario_venta DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2)
    GENERATED ALWAYS AS (cantidad * precio_unitario_venta) STORED,
  PRIMARY KEY (id_detalle),
  KEY idx_detalle_venta (id_venta),
  KEY idx_detalle_producto (id_producto),
  CONSTRAINT fk_detalle_venta
    FOREIGN KEY (id_venta) REFERENCES Venta (id_venta)
    ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto
    FOREIGN KEY (id_producto) REFERENCES Productos (id_producto)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE Evaluaciones (
  id_evaluacion INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL,
  calificacion TINYINT UNSIGNED NOT NULL,
  comentario VARCHAR(1000) NOT NULL,
  estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_evaluacion),
  KEY idx_evaluaciones_usuario (id_usuario),
  CONSTRAINT fk_evaluaciones_usuario
    FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
    ON DELETE CASCADE,
  CONSTRAINT chk_evaluaciones_calificacion
    CHECK (calificacion BETWEEN 1 AND 5)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

INSERT INTO Categoria (categoria) VALUES
  ('Abarrotes'),
  ('Bebidas'),
  ('Lácteos'),
  ('Limpieza'),
  ('Mascotas'),
  ('Otros');

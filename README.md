# Repositorio Central
Repositorio: By gabrielhuav [Repositorio](https://github.com/gabrielhuav/DB-Coursework-2026-2.git)

---

# Documentación Técnica del Backend API - Scynara

**Sistema ERP/POS para la Gestión Empresarial Multi-Sucursal**

El backend de Scynara constituye el núcleo de procesamiento, reglas de negocio y acceso a datos del sistema integral de gestión empresarial. Desarrollado como una API RESTful sobre Node.js y Express, su arquitectura prioriza la seguridad, la integridad transaccional, la escalabilidad y el alto rendimiento.

---

## Índice de Contenidos

1. Introducción
2. Arquitectura de Base de Datos y Reglas de Negocio
3. Seguridad y Control de Acceso
4. Flujo de Procesamiento de Peticiones
5. Estructura del Proyecto
6. Stack Tecnológico
7. Despliegue y Configuración
8. Anexos: Modelos de Datos

---

## 1. Introducción

Esta API actúa como el intermediario exclusivo entre las interfaces de cliente (frontend) y el motor de base de datos MySQL. Se encarga de validar todas las entradas de usuario, aplicar la lógica comercial estricta definida para las operaciones de punto de venta e inventario, y despachar respuestas estructuradas bajo estándares HTTP.

---

## 2. Arquitectura de Base de Datos y Reglas de Negocio

El sistema está respaldado por un diseño relacional altamente normalizado, optimizado para operaciones concurrentes y mantenimiento de integridad referencial estricta.

### 2.1 Gestión Multi-Sucursal

* **Tiendas:** Entidad ancla del sistema. Cada registro operativo (usuarios, clientes, productos, transacciones) posee una llave foránea restrictiva hacia una tienda específica, permitiendo el aislamiento de datos por sucursal y la escalabilidad horizontal del modelo de negocio.

### 2.2 Control de Personal y Jerarquías

Implementación de un modelo de herencia de datos (Supertipo/Subtipo) para la gestión de recursos humanos:

* **Usuarios (Supertipo):** Centraliza la autenticación (correo, contraseña encriptada), datos de contacto, rol general y estado operativo (`ACTIVO`, `INACTIVO`, `BAJA`). Incluye restricción `CHECK` para garantizar contraseñas de al menos 8 caracteres.
* **Administrador (Subtipo):** Define niveles de acceso granulares (`BASICO`, `AVANZADO`, `TOTAL`), control de permisos en formato texto y trazabilidad jerárquica mediante la auto-referencia `id_admin_padre`.
* **Empleado (Subtipo):** Define atributos puramente operativos como tipo de jornada y horarios de entrada/salida. Mantiene un registro restrictivo del administrador que creó la cuenta.

### 2.3 Inventario y Cadena de Suministro

* **Categorías y Proveedores:** Catálogos de normalización para agrupamiento funcional de productos y trazabilidad de origen.
* **Productos:** Núcleo de la gestión de mercancía. Implementa validaciones nativas de base de datos (`CHECK (cantidad >= 0)`, `CHECK (precio_unitario >= 0)`) para impedir escenarios de inventario negativo o precios inválidos, delegando esta responsabilidad crítica al motor de base de datos.

### 2.4 Motor Transaccional (Punto de Venta)

* **Estructura Venta / Detalle_Venta:** Diseño cabecera-detalle para garantizar la atomicidad.
* **Cálculos Automáticos:** La tabla `Detalle_venta` utiliza una columna calculada para el subtotal (`GENERATED ALWAYS AS (cantidad * precio_unitario_venta) STORED`). Esto centraliza la lógica matemática en la base de datos, evitando discrepancias causadas por cálculos asíncronos en la capa de aplicación.

### 2.5 Retroalimentación Operativa

* **Evaluaciones:** Módulo de auditoría de personal con validaciones estrictas (`CHECK (calificacion BETWEEN 1 AND 5)`) y flujo de estados para control de calidad.

---

## 3. Seguridad y Control de Acceso

La API implementa un modelo de defensa en profundidad (Defense in Depth) para proteger los activos de información:

* **Autenticación Stateless:** Emisión y validación de JSON Web Tokens (JWT) para mantener sesiones seguras sin sobrecargar la memoria del servidor.
* **Criptografía Avanzada:** Las contraseñas nunca se almacenan en texto plano. Se utiliza el algoritmo `argon2`, resistente a ataques de fuerza bruta y ataques por canal lateral (side-channel attacks).
* **Validación de Esquemas:** Integración de la biblioteca `Zod` en la capa de middleware. Ninguna petición alcanza los controladores si su estructura (tipos de datos, longitudes, campos obligatorios) no coincide exactamente con el esquema predefinido.
* **Protección de Red:** * `helmet`: Configuración automática de cabeceras de seguridad HTTP (HSTS, prevención de XSS, control de iframes).
* `express-rate-limit`: Restricción temporal de peticiones por IP para mitigar ataques de denegación de servicio (DDoS) y escaneo de vulnerabilidades.



---

## 4. Flujo de Procesamiento de Peticiones

Cada solicitud HTTP sigue un ciclo de vida estrictamente definido:

1. **Recepción:** El router de Express captura la ruta y el verbo HTTP.
2. **Seguridad General:** Evaluación de Rate Limit y cabeceras CORS/Helmet.
3. **Autenticación (Middleware):** Verificación de la firma del JWT.
4. **Autorización (Middleware RBAC):** Validación del rol del usuario contra los permisos requeridos por el endpoint.
5. **Validación de Carga Útil (Zod):** Verificación estricta del `body`, `params` y `query`.
6. **Lógica de Negocio (Controller/Service):** Ejecución de la operación requerida y llamadas al modelo de base de datos.
7. **Respuesta:** Emisión de un código de estado HTTP adecuado y un objeto JSON estandarizado.

---

## 5. Estructura del Proyecto

Organización modular basada en la separación de responsabilidades:

```text
src/
├── config/         # Inicialización de entorno (.env) y pool de conexiones MySQL
├── controllers/    # Orquestadores de peticiones HTTP y respuestas
├── middlewares/    # Interceptores (JWT, RBAC, Rate Limiting, Error Handler)
├── models/         # Consultas SQL preparadas y acceso a datos
├── routes/         # Definición de endpoints y mapeo de controladores
├── schemas/        # Definiciones de Zod para validación de DTOs
├── services/       # Lógica de negocio independiente del transporte HTTP
├── utils/          # Herramientas criptográficas y generadores de tokens
└── app.js          # Punto de entrada y configuración del servidor Express

```

---

## 6. Stack Tecnológico

* **Core:** Node.js, Express v5
* **Persistencia:** MySQL 8.0+, `mysql2` (promesas)
* **Seguridad:** `jsonwebtoken`, `argon2`, `helmet`, `express-rate-limit`, `cors`
* **Validación:** `zod`
* **Gestión de Entorno:** `dotenv`

---

## 7. Despliegue y Configuración

El proyecto está preparado para despliegues automatizados en entornos Cloud (PaaS) o contenedores (Docker).

1. Configurar las variables de entorno detalladas en el archivo `.env.example`.
2. Asegurar que el motor MySQL esté accesible y ejecutar los scripts de migración iniciales (`init.sql`).
3. El archivo `Procfile` incluido dirige los comandos de arranque para plataformas como Heroku o Railway.

---

## 8. Anexos: Modelos de Datos

A continuación se presenta la documentación visual de la estructura de la base de datos para referencia de los desarrolladores y administradores del sistema.

### Anexo A: Modelo Entidad-Relación Conceptual (Diagrama E-R / EER)

<img width="921" height="609" alt="WhatsApp Image 2026-06-02 at 5 22 52 PM" src="https://github.com/user-attachments/assets/481d2d32-340e-4b25-9c8f-25e2a80b8949" />

*Este diagrama ilustra las entidades principales, la jerarquía de generalización/especialización de los usuarios y las cardinalidades del modelo de negocio.*

---

### Anexo B: Esquema Relacional (Físico / Pata de Cuervo)

<img width="1080" height="711" alt="WhatsApp Image 2026-06-02 at 5 26 43 PM" src="https://github.com/user-attachments/assets/dd246794-e2a6-49d2-b2f0-052c1842e250" />

*Este modelo detalla la estructura física implementada en MySQL, mostrando las tablas, claves primarias (PK), claves foráneas (FK), tipos de datos y relaciones directas.*

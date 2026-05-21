# 🚀 Instrucciones para desplegar el Backend en Railway

## ✅ Cambios realizados

Se han preparado los siguientes archivos para el deployment en Railway:

1. **`Procfile`** - Define cómo Railway debe ejecutar tu aplicación
2. **`package.json`** - Agregado script `start` para producción
3. **`.env.example`** - Plantilla de variables de entorno (referencia)
4. **`.gitignore`** - Actualizado para no subir `.env` sensibles

## 📋 Pre-requisitos

1. Cuenta en [Railway.app](https://railway.app)
2. Repositorio en GitHub con solo la carpeta `server`
3. (Opcional) Railway CLI instalado

## 🔧 Paso 1: Preparar el repositorio

```bash
# Asegúrate de que solo esté la carpeta server en Git
git init
git add .
git commit -m "Initial commit for backend deployment"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo-backend.git
git push -u origin main
```

## 🌐 Paso 2: Conectar Railway a tu repositorio

1. Ve a [Railway.app](https://railway.app) y login
2. Haz clic en **"Create a New Project"**
3. Selecciona **"Deploy from GitHub"**
4. Autoriza GitHub y selecciona tu repositorio
5. Haz clic en **"Deploy Now"**

## 🗄️ Paso 3: Configurar MySQL en Railway

Railway detectará automáticamente Node.js. Ahora necesitas agregar MySQL:

1. En el dashboard del proyecto, haz clic en **"+ Add"**
2. Selecciona **"MySQL"** de los servicios disponibles
3. Railway creará la base de datos automáticamente

## ⚙️ Paso 4: Configurar variables de entorno

### Opción A: Automático (Recomendado)
Railway generará automáticamente `MYSQL_PUBLIC_URL` que puedes usar directamente.

### Opción B: Variables individuales
En el Dashboard de Railway:

1. Selecciona tu servicio de Node.js
2. Ve a **"Variables"**
3. Agrega las siguientes variables:

```
PORT = 3000
JWT_SECRET = tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN = 1h
MYSQL_PUBLIC_URL = mysql://usuario:password@host:puerto/database
FRONTEND_URL = https://tu-frontend-vercel.app
```

**Para obtener MYSQL_PUBLIC_URL:**
- Ve al servicio MySQL en Railway
- Copia el valor desde la sección "Connection String" o "Public URL"

**Para FRONTEND_URL:**
- Esta será la URL de tu aplicación en Vercel (ej: `https://scynara.vercel.app`)
- Es necesaria para permitir peticiones desde el frontend (CORS)

## 📦 Paso 5: Verificar el deployment

1. Railway automáticamente ejecutará `npm start` (definido en Procfile)
2. Verifica los logs para asegurarte de que se conecta correctamente a MySQL
3. La URL pública aparecerá en el dashboard de Railway

## 🌍 Paso 6: Obtener la URL de tu API

En el dashboard de Railway:
- Tu aplicación tendrá una URL pública automática (ej: `https://tu-app.railway.app`)
- Usa esta URL para configurar `VITE_API_URL` en tu frontend de Vercel

## 🔄 Actualizar el Frontend

En Vercel, actualiza la variable de entorno:

```
VITE_API_URL = https://tu-app.railway.app
```

## 📝 Variables de entorno - Explicación

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| **PORT** | Puerto donde corre el servidor | 3000 |
| **JWT_SECRET** | Clave para firmar tokens JWT | abc123... |
| **JWT_EXPIRES_IN** | Duración del token | 1h, 24h, 7d |
| **MYSQL_PUBLIC_URL** | Conexión a la base de datos | mysql://user:pass@host/db |
| **FRONTEND_URL** | URL del frontend (para CORS) | https://mi-app.vercel.app |

## ✨ Características de Railway

- ✅ Deploy automático en cada push a main
- ✅ SSL/HTTPS gratuito
- ✅ Escalado automático
- ✅ Logs en tiempo real
- ✅ Monitor de uso de recursos

## 🐛 Solucionar problemas

### "Application failed to start"
- Revisa los logs en Railway
- Verifica que `MYSQL_PUBLIC_URL` esté correctamente configurada

### "Cannot connect to MySQL"
- Asegúrate de que el servicio MySQL está corriendo
- Verifica que la URL de conexión es correcta

### Cambios no se reflejan
- Railway redeploya automáticamente en cada push a main
- Verifica los logs para ver si hay errores

## 📚 Enlaces útiles

- [Documentación de Railway](https://docs.railway.app)
- [Guía Node.js en Railway](https://docs.railway.app/guides/nodejs)
- [Variables de entorno en Railway](https://docs.railway.app/guides/variables)

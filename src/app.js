import express from "express";
import cors from "cors";
import helmet from "helmet";

import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import ventaRoutes from './routes/ventas.routes.js';
import clienteRoutes from './routes/customers.routes.js';
import evaluacionesRoutes from "./routes/evaluations.routes.js";
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { verifyToken } from './middlewares/auth.middleware.js';

import { preventGuestWrites } from './middlewares/role.middleware.js';

const app = express();

// Railway coloca la aplicación detrás de un proxy. Confiar en el primer
// proxy permite que Express y express-rate-limit obtengan la IP real.
app.set("trust proxy", 1);

const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");
const configuredOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  ""
)
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://scynara-frontend.vercel.app",
  ...configuredOrigins,
]);

const isAllowedVercelOrigin = (origin) => {
  try {
    const { protocol, hostname } = new URL(origin);

    return (
      protocol === "https:" &&
      hostname.endsWith(".vercel.app") &&
      (
        hostname === "scynara-frontend.vercel.app" ||
        hostname.startsWith("scynara-frontend-")
      )
    );
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    // Las solicitudes sin Origin suelen venir de herramientas, monitoreo
    // o llamadas directas al servidor.
    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed =
      !origin ||
      allowedOrigins.has(normalizedOrigin) ||
      isAllowedVercelOrigin(normalizedOrigin);

    if (isAllowed) {
      return callback(null, true);
    }

    // No se genera un error 500: simplemente se omiten las cabeceras CORS.
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600
};
app.use(cors(corsOptions));

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
}));
app.use(express.json({ limit: '10kb' }));

app.use(generalLimiter);

app.get("/", (req, res) => {
  res.status(200).json({ status: "API funcionando 🚀" });
});

app.use('/auth', authRoutes);

app.use('/clientes', verifyToken, preventGuestWrites, clienteRoutes);
app.use('/ventas', verifyToken, preventGuestWrites, ventaRoutes);
app.use('/proveedores', verifyToken, preventGuestWrites, proveedorRoutes);
app.use("/products", verifyToken, preventGuestWrites, productRoutes);
app.use("/evaluaciones", evaluacionesRoutes);

app.use(errorHandler);

export default app;

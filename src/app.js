import express from "express";
import cors from "cors";

import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import ventaRoutes from './routes/ventas.routes.js';

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// middlewares
app.use(cors(corsOptions));
app.use(express.json());

// rutas
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});
app.use('/ventas', ventaRoutes);
app.use('/proveedores', proveedorRoutes);
app.use("/products", productRoutes);
app.use('/auth', authRoutes);

app.use(errorHandler);

export default app;
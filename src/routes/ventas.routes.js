import { Router } from 'express';
import { 
  getAll, 
  getById, 
  create 
} from '../controllers/venta.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Protegemos todas las rutas
router.use(verifyToken);

// ─── Rutas de Ventas ───
router.get('/', getAll);           // Historial de ventas de la tienda
router.get('/:id', getById);       // Ver el ticket detallado de una venta específica
router.post('/', create);          // Procesar una nueva venta (carrito)

export default router;
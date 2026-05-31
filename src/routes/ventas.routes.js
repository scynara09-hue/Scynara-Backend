import { Router } from 'express';
import { 
  getAll, 
  getById, 
  create,
  cancel // 💡 Importamos el nuevo controlador
} from '../controllers/venta.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Protegemos todas las rutas
router.use(verifyToken);

// ─── Rutas de Ventas ───
router.get('/', getAll);                 
router.get('/:id', getById);            
router.post('/', create);                
router.patch('/:id/cancel', cancel);     

export default router;
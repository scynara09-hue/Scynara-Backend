import { Router } from 'express';
import { 
  getCategorias, // 👈 Importamos la nueva función
  getAll, 
  getById, 
  create, 
  update, 
  remove 
} from '../controllers/proveedor.controller.js';

import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Protegemos TODAS las rutas de este archivo exigiendo un token válido.
// Esto garantiza que req.user (y req.user.id_tienda) existan en los controladores.
router.use(verifyToken);

// ─── Rutas CRUD de Proveedores ───

// 👇 ESTA DEBE IR PRIMERO 👇
// Si la pones abajo de /:id, Express pensará que la palabra "categorias" es un ID
router.get('/categorias', getCategorias); 

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
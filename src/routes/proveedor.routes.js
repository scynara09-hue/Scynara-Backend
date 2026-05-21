import { Router } from 'express';
import { 
  getAll, 
  getById, 
  create, 
  update, 
  remove 
} from '../controllers/proveedor.controller.js';

// Importa tu middleware que verifica el token JWT
// (Ajusta la ruta o el nombre según cómo lo tengas en tu proyecto)
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Protegemos TODAS las rutas de este archivo exigiendo un token válido.
// Esto garantiza que req.user (y req.user.id_tienda) existan en los controladores.
router.use(verifyToken);

// ─── Rutas CRUD de Proveedores ───
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove
} from '../controllers/product.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protegemos todas las rutas de productos exigiendo un token válido
router.use(verifyToken);

// ─── Rutas CRUD de Productos ───
router.get('/', getAll);            // Obtener todos los productos
router.get('/:id', getById);        // Obtener un producto específico
router.post('/', create);           // Crear un nuevo producto
router.put('/:id', update);         // Actualizar un producto existente
router.delete('/:id', remove);      // Eliminar un producto

export default router;
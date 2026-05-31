import express from 'express';
import {
  getAllClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente
} from '../controllers/customers.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

// ─── Rutas CRUD de Clientes ───
router.get('/', getAllClientes);         // Obtener todos los clientes de la tienda
router.get('/:id', getCliente);          // Obtener un cliente específico
router.post('/', createCliente);         // Crear un nuevo cliente
router.put('/:id', updateCliente);       // Actualizar un cliente existente
router.delete('/:id', deleteCliente);    // Eliminar un cliente

export default router;
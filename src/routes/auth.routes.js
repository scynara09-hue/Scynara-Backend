import express from 'express';
import { register, login, getMe, getUsers, update, remove } from '../controllers/auth.controller.js';
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ─── Rutas Públicas ───
// Esta se queda pública SOLO para que el primer Admin pueda crear su cuenta
router.post('/register', register);
router.post('/login', login);

// ─── Rutas Protegidas (Requieren sesión) ───
router.get('/me', verifyToken, getMe);

// ─── Rutas CRUD de Usuarios ───
router.get('/users', verifyToken, getUsers);
router.post('/users', verifyToken, register);
router.put('/users/:id', verifyToken, update);
router.delete('/users/:id', verifyToken, remove);

export default router;
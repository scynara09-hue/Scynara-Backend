import { Router } from "express";
import { createEvaluation, getPublicEvaluations } from "../controllers/evaluations.controller.js";
import { verifyToken } from '../middlewares/auth.middleware.js'; // 💡 Importación correcta

const router = Router();

// 🌍 RUTA PÚBLICA
router.get("/publicas", getPublicEvaluations);

// 🔒 RUTA PRIVADA
// 💡 Cambiamos authRequired por verifyToken para que coincida con tu importación
router.post("/", verifyToken, createEvaluation); 

export default router;
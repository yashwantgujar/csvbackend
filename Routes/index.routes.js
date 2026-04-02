import express from 'express';
import csvRoutes from './csv.routes.js'; 
import authRoutes from './auth.routes.js';

const router = express.Router();


router.use("/csv", csvRoutes);
router.use("/auth", authRoutes);

export default router;
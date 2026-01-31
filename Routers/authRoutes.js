import express from "express";
import { register, login, getProfile } from "../Controller/authController.js";
import { authenticateToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;

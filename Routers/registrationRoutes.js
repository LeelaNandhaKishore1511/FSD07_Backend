import express from "express";
import {
    registerForEvent,
    getMyRegistrations,
    getEventRegistrations,
    getAllRegistrations,
    cancelRegistration
} from "../Controller/registrationController.js";
import { authenticateToken, authorizeRole } from "../Middleware/authMiddleware.js";

const router = express.Router();

// USER routes
router.post('/', authenticateToken, authorizeRole('USER'), registerForEvent);
router.get('/my', authenticateToken, authorizeRole('USER'), getMyRegistrations);
router.delete('/:registrationId', authenticateToken, authorizeRole('USER'), cancelRegistration);

// ORGANIZER routes
router.get('/event/:eventId', authenticateToken, authorizeRole('ORGANIZER'), getEventRegistrations);
router.get('/all', authenticateToken, authorizeRole('ORGANIZER'), getAllRegistrations);

export default router;

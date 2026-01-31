import express from "express";
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getMyEvents
} from "../Controller/eventController.js";
import { authenticateToken, authorizeRole } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes - ORGANIZER only
router.post('/', authenticateToken, authorizeRole('ORGANIZER'), createEvent);
router.put('/:id', authenticateToken, authorizeRole('ORGANIZER'), updateEvent);
router.delete('/:id', authenticateToken, authorizeRole('ORGANIZER'), deleteEvent);
router.get('/organizer/my-events', authenticateToken, authorizeRole('ORGANIZER'), getMyEvents);

export default router;

import Registration from "../Models/registrationModel.js";
import Event from "../Models/eventModel.js";
import mongoose from "mongoose";

// Register for an event (USER only)
export const registerForEvent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { eventId } = req.body;
        const userId = req.user.id;

        if (!eventId) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
        }

        // Find event with session for transaction
        const event = await Event.findById(eventId).session(session);

        if (!event) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // CRITICAL: Check if event is full
        if (event.currentRegistrations >= event.maxCapacity) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Event is full. Registration closed.'
            });
        }

        // Check if user already registered
        const existingRegistration = await Registration.findOne({
            userId,
            eventId,
            status: 'CONFIRMED'
        }).session(session);

        if (existingRegistration) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        // Create registration
        const registration = new Registration({
            userId,
            eventId,
            status: 'CONFIRMED'
        });

        await registration.save({ session });

        // Increment event registration count
        event.currentRegistrations += 1;
        await event.save({ session });

        await session.commitTransaction();

        // Populate registration details
        await registration.populate('eventId', 'title description eventDate location');

        res.status(201).json({
            success: true,
            message: 'Successfully registered for the event',
            data: { registration }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Registration error:', error);

        // Handle duplicate registration error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Get user's own registrations (USER only)
export const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({
            userId: req.user.id
        })
            .populate('eventId', 'title description eventDate location maxCapacity currentRegistrations')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: { registrations }
        });
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all registrations for a specific event (ORGANIZER only)
export const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Check if event exists and belongs to the organizer
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only view registrations for your own events'
            });
        }

        const registrations = await Registration.find({
            eventId,
            status: 'CONFIRMED'
        })
            .populate('userId', 'username email')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: {
                event: {
                    id: event._id,
                    title: event.title,
                    maxCapacity: event.maxCapacity,
                    currentRegistrations: event.currentRegistrations
                },
                registrations
            }
        });
    } catch (error) {
        console.error('Get event registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all registrations (ORGANIZER only)
export const getAllRegistrations = async (req, res) => {
    try {
        // Get all events created by this organizer
        const organizerEvents = await Event.find({ organizerId: req.user.id });
        const eventIds = organizerEvents.map(event => event._id);

        // Get all registrations for these events
        const registrations = await Registration.find({
            eventId: { $in: eventIds },
            status: 'CONFIRMED'
        })
            .populate('userId', 'username email')
            .populate('eventId', 'title eventDate location')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: { registrations }
        });
    } catch (error) {
        console.error('Get all registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Cancel registration (USER only)
export const cancelRegistration = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { registrationId } = req.params;

        const registration = await Registration.findById(registrationId).session(session);

        if (!registration) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        // Check if user owns this registration
        if (registration.userId.toString() !== req.user.id) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own registrations'
            });
        }

        if (registration.status === 'CANCELLED') {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Registration is already cancelled'
            });
        }

        // Update registration status
        registration.status = 'CANCELLED';
        await registration.save({ session });

        // Decrement event registration count
        const event = await Event.findById(registration.eventId).session(session);
        if (event && event.currentRegistrations > 0) {
            event.currentRegistrations -= 1;
            await event.save({ session });
        }

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: 'Registration cancelled successfully',
            data: { registration }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Cancel registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

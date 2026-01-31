import Event from "../Models/eventModel.js";
import Registration from "../Models/registrationModel.js";

// Get all events
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizerId', 'username email')
            .sort({ eventDate: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: { events }
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get single event by ID
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizerId', 'username email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { event }
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create new event (ORGANIZER only)
export const createEvent = async (req, res) => {
    try {
        const { title, description, eventDate, location, maxCapacity } = req.body;

        // Validation
        if (!title || !description || !eventDate || !location || !maxCapacity) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (maxCapacity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Maximum capacity must be at least 1'
            });
        }

        // Create event
        const event = new Event({
            title,
            description,
            eventDate,
            location,
            maxCapacity,
            organizerId: req.user.id
        });

        await event.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: { event }
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update event (ORGANIZER only)
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the organizer of this event
        if (event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own events'
            });
        }

        const { title, description, eventDate, location, maxCapacity } = req.body;

        // Prevent reducing capacity below current registrations
        if (maxCapacity && maxCapacity < event.currentRegistrations) {
            return res.status(400).json({
                success: false,
                message: `Cannot reduce capacity below current registrations (${event.currentRegistrations})`
            });
        }

        // Update fields
        if (title) event.title = title;
        if (description) event.description = description;
        if (eventDate) event.eventDate = eventDate;
        if (location) event.location = location;
        if (maxCapacity) event.maxCapacity = maxCapacity;

        await event.save();

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: { event }
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete event (ORGANIZER only)
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the organizer of this event
        if (event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own events'
            });
        }

        // Delete all registrations for this event
        await Registration.deleteMany({ eventId: event._id });

        // Delete event
        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Event and associated registrations deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get events created by the logged-in organizer
export const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizerId: req.user.id })
            .sort({ eventDate: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: { events }
        });
    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

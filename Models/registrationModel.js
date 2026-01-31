import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['CONFIRMED', 'CANCELLED'],
        default: 'CONFIRMED'
    }
});

// Compound index to ensure a user can only register once per event
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;

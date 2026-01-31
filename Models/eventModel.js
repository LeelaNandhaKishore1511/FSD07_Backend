import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    maxCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    currentRegistrations: {
        type: Number,
        default: 0,
        min: 0
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual property to check if event is full
eventSchema.virtual('isFull').get(function () {
    return this.currentRegistrations >= this.maxCapacity;
});

// Virtual property to get available slots
eventSchema.virtual('availableSlots').get(function () {
    return this.maxCapacity - this.currentRegistrations;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;

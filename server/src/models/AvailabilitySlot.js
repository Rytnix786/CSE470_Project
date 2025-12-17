const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String, // HH:mm format
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // HH:mm format
      required: [true, 'End time is required'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent overlapping slots
availabilitySlotSchema.index({ doctorId: 1, date: 1, startTime: 1 });

module.exports = mongoose.model('AvailabilitySlot', availabilitySlotSchema);

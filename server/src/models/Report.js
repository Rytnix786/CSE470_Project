const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    reason: {
      type: String,
      enum: ['PROFESSIONALISM', 'COMMUNICATION', 'APPOINTMENT_ISSUES', 'OTHER'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'ACTIONED', 'DISMISSED'],
      default: 'OPEN',
    },
    internalNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
reportSchema.index({ doctorId: 1, createdAt: -1 });
reportSchema.index({ patientId: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
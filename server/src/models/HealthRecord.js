const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    bloodPressure: {
      systolic: { type: Number, default: null },
      diastolic: { type: Number, default: null },
    },
    bloodSugar: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

healthRecordSchema.index({ patientId: 1, date: -1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);

const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['VERIFY_DOCTOR', 'REJECT_DOCTOR', 'SUSPEND_DOCTOR', 'UNSUSPEND_DOCTOR', 'EDIT_DOCTOR', 'SOFT_DELETE_DOCTOR'],
      required: true,
    },
    targetType: {
      type: String,
      default: 'DOCTOR',
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    metadata: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ targetId: 1, createdAt: -1 });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
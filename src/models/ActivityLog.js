const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    flagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flag',
      required: true,
    },
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['decided', 'assigned'],
      required: true,
    },
    decision: {
      type: String,
      enum: ['approved', 'dismissed'],
      default: null,
    },
    reason: {
      type: String,
      trim: true,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ flagId: 1 });
activityLogSchema.index({ auditId: 1 });
activityLogSchema.index({ performedBy: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
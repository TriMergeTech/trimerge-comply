const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    // What was acted on
    targetType: {
      type: String,
      enum: ['audit', 'flag'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },

    // Optional references
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      default: null,
    },
    flagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flag',
      default: null,
    },

    // Who did it
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // What they did
    action: {
      type: String,
      enum: [
        'audit_created',
        'audit_updated',
        'audit_deleted',
        'flag_decided',
        'flag_assigned',
      ],
      required: true,
    },

    // Details
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ targetId: 1 });
activityLogSchema.index({ auditId: 1 });
activityLogSchema.index({ flagId: 1 });
activityLogSchema.index({ performedBy: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['audit', 'flag', 'finding', 'handbook', 'position', 'payequity'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
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
    findingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Finding',
      default: null,
    },
    handbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Handbook',
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: null,
    },
    action: {
      type: String,
      enum: [
        // Audit
        'audit_created',
        'audit_updated',
        'audit_deleted',
        // Flag
        'flag_decided',
        'flag_assigned',
        // Finding
        'finding_created',
        'finding_updated',
        'finding_status_changed',
        'finding_assigned',
        // Handbook
        'handbook_uploaded',
        'handbook_deleted',
        // Position document
        'position_uploaded',
        'position_reviewed',
        // Pay equity
        'payequity_uploaded',
        // CSV adverse impact
        'csv_uploaded',
      ],
      required: true,
    },
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
activityLogSchema.index({ findingId: 1 });
activityLogSchema.index({ handbookId: 1 });
activityLogSchema.index({ performedBy: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ companyName: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
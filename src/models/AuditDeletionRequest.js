const mongoose = require('mongoose');

const auditDeletionRequestSchema = new mongoose.Schema(
  {
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      required: true,
    },
    // Snapshot of the audit at request time — preserved for compliance even after deletion
    auditSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    organizationId: { type: String, trim: true, default: null, index: true },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Mandatory: requester must explain why the audit should be deleted
    deletionNotes: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Deletion notes must be at least 10 characters.'],
    },
    // The Engagement Director selected by the requester to review this request
    directorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    // Mandatory on approve or reject — director must document rationale
    approvalNotes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

auditDeletionRequestSchema.index({ auditId: 1 });
auditDeletionRequestSchema.index({ directorId: 1, status: 1 });
auditDeletionRequestSchema.index({ requestedBy: 1 });
auditDeletionRequestSchema.index({ status: 1 });

module.exports = mongoose.model('AuditDeletionRequest', auditDeletionRequestSchema);

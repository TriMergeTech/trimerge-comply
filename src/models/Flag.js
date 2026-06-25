const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema(
  {
    // Present on audit-linked flags; null on standalone CSV-based flags
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      default: null,
    },
    // Present on CSV-based flags; null on audit-linked flags
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdverseImpactAnalysis',
      default: null,
    },
    companyName: {
      type: String,
      trim: true,
      default: null,
    },
    organizationId: { type: String, trim: true, default: null, index: true },

    // Human-readable label, e.g. "Position – Selection – F" (CSV-based flags)
    name: {
      type: String,
      trim: true,
      default: null,
    },

    // --- Audit-linked flag fields ---
    group: { type: String, trim: true, default: null },
    referenceGroup: { type: String, trim: true, default: null },
    selected: { type: Number, default: null },
    total: { type: Number, default: null },
    selectionRate: { type: Number, default: null },
    impactRatio: { type: Number, default: null },

    // --- Shared fields ---
    threshold: { type: Number, default: 0.8 },
    testType: {
      type: String,
      enum: ['four_fifths', 'fisher_exact', 'chi_square', 'adverse_impact'],
      default: null,
    },
    pValue: { type: Number, default: null },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'reviewed', 'dismissed'],
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Statistical results for CSV-based flags
    // { jobTitle, stage, demographicGroup, fourFifthsRule, chiSquare, fishersExact }
    results: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

flagSchema.index({ auditId: 1 });
flagSchema.index({ uploadId: 1 });
flagSchema.index({ companyName: 1 });
flagSchema.index({ status: 1 });
flagSchema.index({ severity: 1 });
flagSchema.index({ testType: 1 });
flagSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Flag', flagSchema);

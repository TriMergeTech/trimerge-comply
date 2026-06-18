const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema(
  {
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: null,
    },
    organizationId: { type: String, trim: true, default: null, index: true },
    group: {
      type: String,
      required: true,
      trim: true,
    },
    referenceGroup: {
      type: String,
      required: true,
      trim: true,
    },
    selected: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    selectionRate: {
      type: Number,
      required: true,
    },
    impactRatio: {
      type: Number,
      default: null,
    },
    threshold: {
      type: Number,
      default: 0.8,
    },
    testType: {
      type: String,
      enum: ['four_fifths', 'fisher_exact', 'chi_square'],
      required: true,
    },
    pValue: {
      type: Number,
      default: null,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
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
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

flagSchema.index({ auditId: 1 });
flagSchema.index({ companyName: 1 });
flagSchema.index({ status: 1 });
flagSchema.index({ severity: 1 });
flagSchema.index({ testType: 1 });
flagSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Flag', flagSchema);
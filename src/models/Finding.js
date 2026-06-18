const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema(
  {
    auditId: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
    flagId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flag', default: null },

    observation: { type: String, required: true, trim: true },
    risk: {
      level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true,
        default: 'medium',
      },
      description: { type: String, trim: true, default: '' },
    },

    // AI-drafted fields — analyst always reviews before approval
    criteria: { type: String, trim: true, default: '' },
    recommendation: { type: String, trim: true, default: '' },

    status: {
      type: String,
      enum: [
        'new',
        'under_review',
        'additional_info_required',
        'approved',
        'rejected',
        'closed',
      ],
      default: 'new',
    },

    handbookReference: {
      handbookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Handbook', default: null },
      section: { type: String, default: '' },
      excerpt: { type: String, default: '' },
    },

    aiDrafted: { type: Boolean, default: false },
    analystNotes: { type: String, trim: true, default: '', maxlength: 5000 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },

    companyName: { type: String, trim: true, default: null },
    organizationId: { type: String, trim: true, default: null, index: true },
  },
  { timestamps: true }
);

findingSchema.index({ auditId: 1 });
findingSchema.index({ flagId: 1 });
findingSchema.index({ status: 1 });
findingSchema.index({ 'risk.level': 1 });
findingSchema.index({ createdBy: 1 });
findingSchema.index({ companyName: 1 });
findingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Finding', findingSchema);

const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Audit name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'completed', 'flagged'],
      default: 'draft',
    },
    organization: {
      type: String,
      trim: true,
      default: null,
    },
    clientName: {
      type: String,
      trim: true,
      default: null,
    },
    auditType: {
      type: String,
      trim: true,
      default: null,
    },
    companyName: {
      type: String,
      trim: true,
      default: null,
    },
    organizationId: { type: String, trim: true, default: null, index: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

auditSchema.index({ clientName: 1 });
auditSchema.index({ auditType: 1 });
auditSchema.index({ status: 1 });
auditSchema.index({ createdBy: 1 });
auditSchema.index({ companyName: 1 });
auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Audit', auditSchema);
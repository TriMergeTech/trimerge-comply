const mongoose = require('mongoose');

const adverseImpactAnalysisSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, default: 'text/csv', trim: true },
    sizeBytes: { type: Number, default: 0 },
    storage: {
      publicId: String,
      secureUrl: String,
      resourceType: String,
      bytes: Number,
      format: String,
      createdAt: String,
      originalFilename: String,
    },
    uploadedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      email: { type: String, default: 'System Upload' },
      companyName: { type: String, default: null },
      role: { type: String, default: null },
    },
    companyName: { type: String, required: true, trim: true, index: true },
    organizationId: { type: String, trim: true, default: null, index: true },
    datasetType: { type: String, default: 'grouped_adverse_impact' },
    summary: { type: mongoose.Schema.Types.Mixed, default: {} },
    analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
    warnings: { type: [mongoose.Schema.Types.Mixed], default: [] },
    status: { type: String, enum: ['processed', 'failed'], default: 'processed' },
  },
  { timestamps: true }
);

adverseImpactAnalysisSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdverseImpactAnalysis', adverseImpactAnalysisSchema);

const mongoose = require('mongoose');

const payEquityAnalysisSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      default: 'text/csv',
      trim: true,
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
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
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      email: {
        type: String,
        default: 'System Upload',
      },
      companyName: {
        type: String,
        default: null,
      },
      role: {
        type: String,
        default: null,
      },
    },
    dataset: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    model: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    payGaps: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    warnings: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    uiSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['processed', 'failed'],
      default: 'processed',
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

payEquityAnalysisSchema.index({ createdAt: -1 });
payEquityAnalysisSchema.index({ status: 1 });
payEquityAnalysisSchema.index({ 'uploadedBy.userId': 1 });

module.exports = mongoose.model('PayEquityAnalysis', payEquityAnalysisSchema);

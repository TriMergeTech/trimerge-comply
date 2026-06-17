const mongoose = require('mongoose');

const positionDocumentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
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
    textLength: {
      type: Number,
      default: 0,
    },
    extractedTextPreview: {
      type: String,
      default: '',
    },
    extractedText: {
      type: String,
      default: '',
    },
    aiConfigured: {
      type: Boolean,
      default: false,
    },
    analysisStatus: {
      type: String,
      enum: ['stored', 'skipped', 'completed', 'failed'],
      default: 'stored',
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    standardsReview: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    analystNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 5000,
    },
    resolutionStatus: {
      type: String,
      enum: ['not_reviewed', 'in_review', 'approved', 'needs_changes', 'dismissed'],
      default: 'not_reviewed',
    },
    reviewedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      email: {
        type: String,
        default: null,
      },
      role: {
        type: String,
        default: null,
      },
    },
    reviewedAt: {
      type: Date,
      default: null,
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

positionDocumentSchema.index({ analysisStatus: 1 });
positionDocumentSchema.index({ resolutionStatus: 1 });
positionDocumentSchema.index({ createdAt: -1 });
positionDocumentSchema.index({ 'uploadedBy.userId': 1 });

module.exports = mongoose.model('PositionDocument', positionDocumentSchema);

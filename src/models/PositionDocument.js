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
    textLength: {
      type: Number,
      default: 0,
    },
    extractedTextPreview: {
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
  },
  { timestamps: true }
);

positionDocumentSchema.index({ analysisStatus: 1 });
positionDocumentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PositionDocument', positionDocumentSchema);

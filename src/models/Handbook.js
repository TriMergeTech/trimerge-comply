const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    content: { type: String, required: true },
    startChar: { type: Number, default: 0 },
    endChar: { type: Number, default: 0 },
  },
  { _id: false }
);

const handbookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
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
      email: { type: String, default: null },
      companyName: { type: String, default: null },
      role: { type: String, default: null },
    },

    companyName: { type: String, trim: true, default: null },
    organizationId: { type: String, trim: true, default: null, index: true },

    textLength: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    chunks: { type: [chunkSchema], default: [] },

    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

handbookSchema.index({ 'uploadedBy.userId': 1 });
handbookSchema.index({ companyName: 1 });
handbookSchema.index({ status: 1 });
handbookSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Handbook', handbookSchema);

const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    auditId: { type: String, default: null },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    rowsProcessed: { type: Number, default: 0 },
    flagsGenerated: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Upload', uploadSchema);

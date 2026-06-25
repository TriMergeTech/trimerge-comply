const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    findingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Finding', required: true },
    auditId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Audit',   required: true },
    organizationId: { type: String, trim: true, default: null, index: true },

    type: {
      type: String,
      enum: ['document', 'statistical_result', 'interview_note', 'policy_excerpt', 'data_extract', 'observation_note'],
      required: true,
    },

    // Where the content originated
    source: {
      type: String,
      enum: ['manual', 'flag', 'payequity', 'adverse_impact', 'position', 'handbook'],
      default: 'manual',
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId, default: null },

    title:       { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, default: '' },
    content:     { type: String, trim: true, default: '' },

    // Uploaded file — populated by the /upload route, null on text-only entries
    file: {
      fileName:  { type: String, default: null },
      fileUrl:   { type: String, default: null },
      publicId:  { type: String, default: null },
      mimeType:  { type: String, default: null },
      sizeBytes: { type: Number, default: null },
    },

    // Interview-note extras
    interviewee:   { type: String, trim: true, default: null },
    interviewDate: { type: Date,             default: null },

    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

evidenceSchema.index({ findingId: 1 });
evidenceSchema.index({ auditId: 1 });
evidenceSchema.index({ source: 1 });
evidenceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Evidence', evidenceSchema);

const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  title:       String,
  severity:    { type: String, enum: ['low', 'medium', 'high'] },
  category:    String,
  evidence:    String,
  explanation: String,
}, { _id: true });

const positionSchema = new mongoose.Schema({
  documentName:      { type: String, required: true },
  fileName:          { type: String, required: true },
  mimeType:          { type: String, default: 'text/plain' },
  uploadedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:            { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  summary:           { type: String, default: '' },
  overallRisk:       { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  flagSummary:       [flagSchema],
  aiRecommendations: [String],
  analystNotes:      { type: String, default: '' },
  resolutionStatus:  { type: String, default: 'unresolved' },
  reviewedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:        { type: Date, default: null },
  textPreview:       { type: String, default: '' },
  storage: {
    publicId:         { type: String, default: '' },
    secureUrl:        { type: String, default: '' },
    resourceType:     { type: String, default: 'raw' },
    bytes:            { type: Number, default: 0 },
    originalFilename: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Position', positionSchema);

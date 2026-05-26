const mongoose = require('mongoose');

const payEquitySchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalEmployees: { type: Number, default: 0 },
    departmentsAnalyzed: { type: Number, default: 0 },
    demographicGroupsCount: { type: Number, default: 0 },
    flagsGenerated: { type: Number, default: 0 },
    departmentGaps: [
      {
        department: { type: String },
        gap: { type: Number },
      },
    ],
    demographicGaps: [
      {
        group: { type: String },
        unadjustedGap: { type: Number },
        adjustedGap: { type: Number },
        flagged: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PayEquity', payEquitySchema);

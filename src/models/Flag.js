const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    testType: {
      type: String,
      enum: ['adverse_impact', 'position_description', 'pay_equity'],
      default: 'adverse_impact',
    },
    auditId: { type: String, default: null },
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Dismissed', 'Escalated'],
      default: 'Pending',
    },
    assignedTo: { type: String, default: 'Unassigned' },
    uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', default: null },
    results: {
      jobTitle: String,
      stage: String,
      demographicGroup: String,
      fourFifthsRule: Number,
      chiSquare: Number,
      fishersExact: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flag', flagSchema);

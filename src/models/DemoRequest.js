const mongoose = require('mongoose');

const demoRequestSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    workEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40,
    },
    companySize: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    interests: {
      type: [String],
      enum: [
        'adverse_impact_analysis',
        'pay_equity_analysis',
        'position_description_review',
        'all_of_the_above',
      ],
      default: [],
    },
    additionalDetails: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'scheduled', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

demoRequestSchema.index({ createdAt: -1 });
demoRequestSchema.index({ status: 1, createdAt: -1 });
demoRequestSchema.index({ workEmail: 1 });

module.exports = mongoose.model('DemoRequest', demoRequestSchema);

const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Audit name is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: ['draft', 'processing', 'completed', 'flagged'],
      default: 'draft',
    },

    organization: {
      type: String,
      trim: true,
      default: null,
    },

    // The user who created this audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('Audit', auditSchema);

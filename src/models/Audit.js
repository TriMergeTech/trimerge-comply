const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Audit name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
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
    clientName: {                                    // 👈 add
      type: String,
      trim: true,
      default: null,
    },
    auditType: {                                     // 👈 add
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Audit', auditSchema);
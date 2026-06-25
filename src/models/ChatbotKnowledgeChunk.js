const mongoose = require('mongoose');

const indexedBySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    email: { type: String, default: null },
    role: { type: String, default: null },
  },
  { _id: false }
);

const chatbotKnowledgeChunkSchema = new mongoose.Schema(
  {
    chatbotKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    sourceName: {
      type: String,
      required: true,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ['pdf', 'docx', 'text'],
      default: 'pdf',
    },
    sourceHash: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    pageNumber: {
      type: Number,
      default: null,
    },
    sectionTitle: {
      type: String,
      trim: true,
      default: 'General',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    contentPreview: {
      type: String,
      trim: true,
      default: '',
    },
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },
    embeddingModel: {
      type: String,
      trim: true,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    indexedBy: {
      type: indexedBySchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

chatbotKnowledgeChunkSchema.index(
  { chatbotKey: 1, sourceName: 1, chunkIndex: 1 },
  { unique: true }
);
chatbotKnowledgeChunkSchema.index({ chatbotKey: 1, sourceName: 1, pageNumber: 1 });
chatbotKnowledgeChunkSchema.index({ chatbotKey: 1, createdAt: -1 });

module.exports = mongoose.model('ChatbotKnowledgeChunk', chatbotKnowledgeChunkSchema);

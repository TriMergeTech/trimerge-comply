const { generateSupportChatAnswer } = require('../../ai/openai.service');
const {
  SUPPORT_CHATBOT_KEY,
  getSupportManualStatus,
  searchSupportManualChunks,
} = require('./supportRag.service');

const sanitizeSourceExcerpt = (text = '') =>
  String(text)
    .replace(/\b(GET|POST|PATCH|PUT|DELETE)\s+\/api\/[^\s,.;)]+/gi, 'the related platform action')
    .replace(/\/api\/[^\s,.;)]+/gi, 'the related platform area')
    .replace(/\b(token|api key|secret|password|database|mongodb|cloudinary|mailgun|openai)\b/gi, '[internal detail]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);

const normalizeSources = (chunks) =>
  chunks.map((chunk, index) => ({
    sourceNumber: index + 1,
    sourceName: chunk.sourceName,
    pageNumber: chunk.pageNumber,
    sectionTitle: chunk.sectionTitle,
    excerpt: sanitizeSourceExcerpt(chunk.contentPreview),
    relevanceScore: Number(chunk.score.toFixed(4)),
  }));

const askSupportChatbot = async ({ question }) => {
  const status = await getSupportManualStatus();

  if (!status.indexed) {
    const err = new Error('Support guidance has not been prepared yet. Please contact an admin.');
    err.statusCode = 409;
    throw err;
  }

  const chunks = await searchSupportManualChunks({ question });

  if (!chunks.length) {
    return {
      chatbotKey: SUPPORT_CHATBOT_KEY,
      answer: 'TriMerge Comply guidance does not provide enough information to answer that question.',
      confidence: 'low',
      nextSteps: ['Try asking about a specific platform screen, workflow, role, or report.'],
      sources: [],
    };
  }

  const aiAnswer = await generateSupportChatAnswer({ question, chunks });

  return {
    chatbotKey: SUPPORT_CHATBOT_KEY,
    answer: aiAnswer.answer,
    confidence: aiAnswer.confidence,
    nextSteps: aiAnswer.nextSteps,
    sources: normalizeSources(chunks),
  };
};

module.exports = {
  askSupportChatbot,
};

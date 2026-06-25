const {
  getSupportManualStatus,
  reindexSupportManual,
} = require('../services/chatbots/support/supportRag.service');
const { askSupportChatbot } = require('../services/chatbots/support/supportChat.service');
const { sendSuccess, sendError } = require('../utils/response');

const askSupportChat = async (req, res, next) => {
  try {
    const result = await askSupportChatbot({ question: req.body.question });

    return sendSuccess(res, {
      message: 'Support chatbot answer generated successfully.',
      data: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

const getSupportRagStatus = async (req, res, next) => {
  try {
    const status = await getSupportManualStatus();

    return sendSuccess(res, {
      message: 'Support chatbot RAG status retrieved successfully.',
      data: status,
    });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

const reindexSupportRag = async (req, res, next) => {
  try {
    const result = await reindexSupportManual({ user: req.user });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Support chatbot manual indexed successfully.',
      data: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return sendError(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

module.exports = {
  askSupportChat,
  getSupportRagStatus,
  reindexSupportRag,
};

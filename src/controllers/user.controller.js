const User = require('../models/User');
const { sendSuccess } = require('../utils/response');

// GET /api/users/directors
// Returns all directors available to receive deletion approval requests.
// No org scoping intentionally — allows cross-org director selection during testing.
const listDirectors = async (req, res, next) => {
  try {
    const directors = await User.find({ role: 'director' })
      .select('_id name email')
      .sort({ name: 1 })
      .lean();

    return sendSuccess(res, {
      message: directors.length
        ? `${directors.length} director(s) available.`
        : 'No directors found. Contact your administrator.',
      data: { directors, total: directors.length },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listDirectors };

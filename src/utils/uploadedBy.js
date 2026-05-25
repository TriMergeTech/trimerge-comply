const getUploadedBy = (user) => {
  if (!user) {
    return {
      userId: null,
      email: 'System Upload',
      companyName: null,
      role: null,
    };
  }

  return {
    userId: user._id,
    email: user.email || 'Unknown User',
    companyName: user.companyName || null,
    role: user.role || null,
  };
};

const getUploaderLabel = (uploadedBy = {}) => uploadedBy.email || 'System Upload';

module.exports = {
  getUploadedBy,
  getUploaderLabel,
};

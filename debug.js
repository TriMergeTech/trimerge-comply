require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User');
  const users = await User.find({}).select('+otpCode +otpExpiresAt +otpPurpose');
  users.forEach(u => {
    console.log('email:', u.email);
    console.log('otpCode:', u.otpCode);
    console.log('otpExpiresAt:', u.otpExpiresAt);
    console.log('otpPurpose:', u.otpPurpose);
    console.log('---');
  });
  mongoose.disconnect();
});

const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // 2 minutes expiry as requested
    expires: 120, // this will automatically delete documents after 120 seconds
  },
});

module.exports = mongoose.model('ResetToken', resetTokenSchema);

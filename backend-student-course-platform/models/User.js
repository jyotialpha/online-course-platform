const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true }, // For admin
  email: { type: String, unique: true, sparse: true }, // For student (Google OAuth)
  password: { type: String }, // For admin
  googleId: { type: String }, // For student
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
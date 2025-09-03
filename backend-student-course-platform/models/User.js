const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true }, // For admin
  email: { type: String, unique: true, sparse: true }, // For student (Google OAuth)
  password: { type: String }, // For admin
  googleId: { type: String }, // For student
  googleProfile: {
    name: { type: String },
    photoUrl: { type: String },
    email: { type: String }
  },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  enrolledCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['enrolled', 'purchased'], default: 'enrolled' },
    paymentId: { type: String }, // For future purchase implementation
    amount: { type: Number, default: 0 } // For future purchase implementation
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
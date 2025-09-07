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
    paymentId: { type: String },
    amount: { type: Number, default: 0 },
    progress: {
      completedChapters: [{ type: String }], // Chapter IDs
      lastAccessedChapter: { type: String },
      lastAccessedAt: { type: Date },
      overallProgress: { type: Number, default: 0 }, // Percentage
      timeSpent: { type: Number, default: 0 } // Minutes
    }
  }],
  testResults: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    chapterId: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    timeSpent: { type: Number, required: true }, // Seconds
    completedAt: { type: Date, default: Date.now },
    answers: [{
      questionId: { type: String, required: true },
      selectedAnswer: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
      timeSpent: { type: Number, default: 0 } // Seconds per question
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
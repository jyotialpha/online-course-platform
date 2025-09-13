const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String }
});

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pdf: { type: String }, // store file path or URL, can be null
  questions: [QuestionSchema]
});

const SubjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  chapters: [ChapterSchema]
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  isFree: { type: Boolean, default: true },
  thumbnail: { type: String },
  subjects: [SubjectSchema]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);

import mongoose from 'mongoose';

const QuizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subtopicId: {
    type: String,
    ref: 'Subtopic',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  xpEarned: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);

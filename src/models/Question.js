import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  subtopicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtopic',
    required: true,
  },
  questionText: {
    type: String,
    required: [true, 'Please provide the question text'],
  },
  options: {
    type: [String],
    required: [true, 'Please provide option choices'],
    validate: [arrayLimit, 'A question must have at least 2 and at most 5 options'],
  },
  correctOption: {
    type: Number, // 0-based index of options array
    required: [true, 'Please provide the correct option index'],
  },
  explanation: {
    type: String,
    required: [true, 'Please provide an explanation for the correct answer'],
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
}, { timestamps: true });

function arrayLimit(val) {
  return val.length >= 2 && val.length <= 5;
}

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);

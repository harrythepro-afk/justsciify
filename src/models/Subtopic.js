import mongoose from 'mongoose';

const SubtopicSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a subtopic title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a subtopic description'],
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.Subtopic || mongoose.model('Subtopic', SubtopicSchema);

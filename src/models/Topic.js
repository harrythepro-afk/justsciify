import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a topic title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a topic description'],
  },
  classNum: {
    type: Number,
    required: [true, 'Please provide a class number'],
    enum: [3, 4, 5, 6, 7, 8, 9, 10],
  },
  icon: {
    type: String,
    required: [true, 'Please provide an icon name'],
    default: '🔬',
  },
}, { timestamps: true });

export default mongoose.models.Topic || mongoose.model('Topic', TopicSchema);

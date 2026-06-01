import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  classNum: {
    type: Number,
    required: [true, 'Please select a class'],
    enum: [3, 4, 5, 6, 7, 8, 9, 10],
    default: 4,
  },
  beltLevel: {
    type: String,
    enum: ['white', 'yellow', 'green', 'blue', 'red', 'black'],
    default: 'white',
  },
  xp: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  completedTopics: {
    type: [String], // Array of completed Topic IDs or Subtopic IDs
    default: [],
  },
  unlockedAvatars: {
    type: [String],
    default: ['explorer_default'],
  },
  avatarId: {
    type: String,
    default: 'explorer_default',
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

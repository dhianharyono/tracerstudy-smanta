import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId;
  role: 'alumni' | 'student';
  rating: number;
  kritik?: string;
  saran?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['alumni', 'student'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    kritik: {
      type: String,
      trim: true,
    },
    saran: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one feedback per user
FeedbackSchema.index({ user: 1 }, { unique: true });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);







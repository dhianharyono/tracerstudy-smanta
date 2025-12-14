import mongoose, { Document, Schema } from 'mongoose';

export interface INewsRead extends Document {
  user: mongoose.Types.ObjectId;
  news: mongoose.Types.ObjectId;
  readAt: Date;
  createdAt: Date;
}

const NewsReadSchema = new Schema<INewsRead>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one read record per user per news
NewsReadSchema.index({ user: 1, news: 1 }, { unique: true });

export default mongoose.model<INewsRead>('NewsRead', NewsReadSchema);









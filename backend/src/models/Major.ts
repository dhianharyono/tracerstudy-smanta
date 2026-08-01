import mongoose, { Document, Schema } from 'mongoose';

export interface IMajor extends Document {
  name: string;
  isVerified: boolean;
  addedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MajorSchema = new Schema<IMajor>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMajor>('Major', MajorSchema);

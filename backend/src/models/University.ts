import mongoose, { Document, Schema } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  type?: 'negeri' | 'swasta' | 'kedinasan' | 'luar negeri' | '';
  location?: string;
  addedBy?: mongoose.Types.ObjectId;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema = new Schema<IUniversity>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['negeri', 'swasta', 'kedinasan', 'luar negeri', ''],
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUniversity>('University', UniversitySchema);

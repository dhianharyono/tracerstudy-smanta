import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  category: 'Teknologi & IT' | 'Ekonomi & Bisnis' | 'Pendidikan' | 'Kesehatan' | 'Industri & Teknik' | 'Kreatif & Media' | 'Sosial & Humaniora' | 'Lainnya';
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Freelance';
  description: string;
  requirements: string[];
  applicationLink: string;
  expiryDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  rejectionReason?: string;
  postedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Teknologi & IT',
        'Ekonomi & Bisnis',
        'Pendidikan',
        'Kesehatan',
        'Industri & Teknik',
        'Kreatif & Media',
        'Sosial & Humaniora',
        'Lainnya',
      ],
    },
    type: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Internship', 'Freelance'],
    },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    applicationLink: { type: String },
    expiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'closed'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
JobSchema.index({ status: 1, expiryDate: 1 });
JobSchema.index({ postedBy: 1 });

export default mongoose.model<IJob>('Job', JobSchema);

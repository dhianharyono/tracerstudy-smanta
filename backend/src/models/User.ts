import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'alumni' | 'admin' | 'student';
  profile?: {
    fullName?: string;
    gender?: 'male' | 'female';
    entryYear?: number;
    graduationYear?: number;
    lastEducation?: string;
    isStudying?: boolean;
    isWorking?: boolean;
  };
  university?: {
    name?: string;
    type?: 'negeri' | 'swasta' | 'kedinasan';
    entryYear?: number;
    major?: string;
  };
  job?: {
    position?: string;
    institution?: string;
    jobTitle?: string;
  };
  socialMedia?: {
    email?: string;
    linkedin?: string;
    instagram?: string;
  };
  questionnaireCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['alumni', 'admin', 'student'],
      required: true,
    },
    profile: {
      fullName: String,
      gender: {
        type: String,
        enum: ['male', 'female'],
      },
      entryYear: Number,
      graduationYear: Number,
      lastEducation: String,
      isStudying: Boolean,
      isWorking: Boolean,
    },
    university: {
      name: String,
      type: {
        type: String,
        enum: ['negeri', 'swasta', 'kedinasan'],
      },
      entryYear: Number,
      major: String,
    },
    job: {
      position: String,
      institution: String,
      jobTitle: String,
    },
    socialMedia: {
      email: String,
      linkedin: String,
      instagram: String,
    },
    questionnaireCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);















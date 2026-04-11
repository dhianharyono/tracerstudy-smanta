import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'alumni' | 'admin' | 'student' | 'school';
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
    graduationYear?: number;
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
  isMentor: boolean;
  badges: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
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
      enum: ['alumni', 'admin', 'student', 'school'],
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
      graduationYear: Number,
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
    isMentor: {
      type: Boolean,
      default: false,
    },
    badges: [{
      type: Schema.Types.ObjectId,
      ref: 'Badge'
    }],
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ role: 1 });
UserSchema.index({ role: 1, questionnaireCompleted: 1 });
UserSchema.index({ role: 1, isMentor: 1 });
UserSchema.index({ 'university.name': 1 }); // For alumni map grouping

export default mongoose.model<IUser>('User', UserSchema);















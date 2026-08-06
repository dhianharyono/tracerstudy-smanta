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
    entryPath?: string;
  };
  universityS2?: {
    name?: string;
    major?: string;
  };
  universityS3?: {
    name?: string;
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
  isHidden?: boolean;
  badges: mongoose.Types.ObjectId[];
  isVerifiedBySchool: boolean;
  verifiedAt?: Date;
  schoolRole?: 'bk' | 'teacher';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
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
        enum: ['male', 'female', ''],
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
        enum: ['negeri', 'swasta', 'kedinasan', ''],
      },
      entryYear: Number,
      graduationYear: Number,
      major: String,
      entryPath: String,
    },
    universityS2: {
      name: String,
      major: String,
    },
    universityS3: {
      name: String,
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
    isHidden: {
      type: Boolean,
      default: false,
    },
    badges: [{
      type: Schema.Types.ObjectId,
      ref: 'Badge'
    }],
    isVerifiedBySchool: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    schoolRole: {
      type: String,
      enum: ['bk', 'teacher', ''],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
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
UserSchema.index({ role: 1, isHidden: 1 });
UserSchema.index({ 'profile.graduationYear': 1 });
UserSchema.index({ 'university.name': 1 });
UserSchema.index({ 'university.major': 1 });
UserSchema.index({ 'profile.isWorking': 1 });
UserSchema.index({ 'profile.isStudying': 1 });

export default mongoose.model<IUser>('User', UserSchema);















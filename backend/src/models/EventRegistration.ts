import mongoose, { Document, Schema } from 'mongoose';

export interface IEventRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  expectation: string;
  studyPlan: {
    university: string;
    major: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expectation: {
      type: String,
      required: true,
      minlength: [1, 'Harapan wajib diisi'],
      trim: true,
    },
    studyPlan: {
      university: {
        type: String,
        required: true,
        minlength: [1, 'Universitas wajib dipilih'],
        trim: true,
      },
      major: {
        type: String,
        required: true,
        minlength: [1, 'Jurusan wajib dipilih'],
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IEventRegistration>(
  'EventRegistration',
  EventRegistrationSchema,
);

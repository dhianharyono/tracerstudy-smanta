import mongoose, { Document, Schema } from 'mongoose';

export interface ICollegePlan extends Document {
    user: mongoose.Types.ObjectId;
    targetUniversity: string;
    targetMajor: string;
    rumpun: string; // Saintek, Soshum
    entryPath: string; // SNBP, SNBT, Mandiri, Kedinasan, dll
    readinessStatus: string; // Yakin, Masih Ragu, Hanya Cadangan
    isAnonymous: boolean;
    lockCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const CollegePlanSchema = new Schema<ICollegePlan>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        targetUniversity: {
            type: String,
            required: true,
        },
        targetMajor: {
            type: String,
            required: true,
        },
        rumpun: {
            type: String,
            required: true,
            enum: ['Saintek', 'Soshum', 'Lainnya'],
        },
        entryPath: {
            type: String,
            required: true,
            enum: ['SNBP', 'SNBT', 'Mandiri', 'Kedinasan', 'Luar Negeri', 'Lainnya'],
        },
        readinessStatus: {
            type: String,
            required: true,
            enum: ['Yakin', 'Masih Ragu', 'Hanya Cadangan'],
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        lockCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICollegePlan>('CollegePlan', CollegePlanSchema);

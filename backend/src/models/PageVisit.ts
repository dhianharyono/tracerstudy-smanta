import mongoose, { Document, Schema } from 'mongoose';

export interface IPageVisit extends Document {
    userId: mongoose.Types.ObjectId;
    role: string;
    path: string;
    menuName: string;
    timestamp: Date;
}

const PageVisitSchema = new Schema<IPageVisit>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        menuName: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IPageVisit>('PageVisit', PageVisitSchema);

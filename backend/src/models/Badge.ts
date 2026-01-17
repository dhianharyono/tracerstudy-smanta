import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
    name: string;
    description: string;
    code: string;
    expiredDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        expiredDate: { type: Date, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IBadge>('Badge', BadgeSchema);

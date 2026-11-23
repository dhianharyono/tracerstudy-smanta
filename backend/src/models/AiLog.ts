import mongoose, { Document, Schema } from 'mongoose';

export interface IAiLog extends Document {
  user: {
    userId?: mongoose.Types.ObjectId;
    fullName?: string;
    username?: string;
    email?: string;
    role: string;
  };
  query: string;
  responsePreview?: string;
  aiModel: string;
  status: 'success' | 'error';
  errorMessage?: string;
  latencyMs: number;
  tokensEstimated: {
    promptChars: number;
    responseChars: number;
    totalChars: number;
  };
  hasCitation: boolean;
  recommendationsCount: number;
  ipAddress?: string;
  timestamp: Date;
}

const AiLogSchema = new Schema<IAiLog>({
  user: {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, default: 'Pengguna' },
    username: { type: String },
    email: { type: String },
    role: { type: String, required: true },
  },
  query: { type: String, required: true },
  responsePreview: { type: String },
  aiModel: { type: String, required: true, default: 'gemini-3.5-flash-lite' },
  status: { type: String, enum: ['success', 'error'], required: true, default: 'success' },
  errorMessage: { type: String },
  latencyMs: { type: Number, default: 0 },
  tokensEstimated: {
    promptChars: { type: Number, default: 0 },
    responseChars: { type: Number, default: 0 },
    totalChars: { type: Number, default: 0 },
  },
  hasCitation: { type: Boolean, default: false },
  recommendationsCount: { type: Number, default: 0 },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
});

AiLogSchema.index({ timestamp: -1 });
AiLogSchema.index({ 'user.role': 1, timestamp: -1 });
AiLogSchema.index({ status: 1, timestamp: -1 });
AiLogSchema.index({ 'user.userId': 1 });

export default mongoose.model<IAiLog>('AiLog', AiLogSchema);

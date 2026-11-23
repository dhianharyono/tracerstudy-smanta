import mongoose, { Document, Schema } from 'mongoose';

export interface IAiConfig extends Document {
  apiKey?: string;
  apiKeys?: string[];
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  systemInstructionOverride?: string;
  lastTestedAt?: Date;
  testStatus?: 'success' | 'failed';
  testMessage?: string;
  updatedBy?: {
    userId: mongoose.Types.ObjectId;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AiConfigSchema = new Schema<IAiConfig>(
  {
    apiKey: { type: String, default: '' },
    apiKeys: { type: [String], default: [] },
    selectedModel: { type: String, required: true, default: 'gemini-2.5-flash' },
    temperature: { type: Number, default: 0.7, min: 0, max: 2 },
    maxTokens: { type: Number, default: 2048, min: 256, max: 8192 },
    isActive: { type: Boolean, default: true },
    systemInstructionOverride: { type: String, default: '' },
    lastTestedAt: { type: Date },
    testStatus: { type: String, enum: ['success', 'failed'] },
    testMessage: { type: String },
    updatedBy: {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      username: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAiConfig>('AiConfig', AiConfigSchema);

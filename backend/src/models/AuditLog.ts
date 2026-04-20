import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  actor: {
    userId: mongoose.Types.ObjectId;
    username: string;
    role: string;
  };
  target: {
    type: string;
    name?: string;
  };
  details: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  actor: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    role: { type: String, required: true },
  },
  target: {
    type: { type: String, required: true },
    name: String,
  },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ 'actor.username': 1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

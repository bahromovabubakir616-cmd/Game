import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reporterId: string;
  reportedId: string;
  reason: string;
  status: 'Pending' | 'Reviewed' | 'Dismissed' | 'Banned';
  timestamp: Date;
}

const ReportSchema: Schema = new Schema({
  reporterId: { type: String, required: true },
  reportedId: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Dismissed', 'Banned'], default: 'Pending' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

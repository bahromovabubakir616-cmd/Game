import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluationScore {
  communicationActivity: number;
  speechFluency: number;
  politeness: number;
  engagement: number;
  overallImpression: number;
}

export interface IParticipantEvaluation {
  socketId: string;
  username: string;
  scores: IEvaluationScore;
  totalScore: number;
}

export interface IEvaluation extends Document {
  participants: IParticipantEvaluation[];
  winnerSocketId: string;
  createdAt: Date;
}

const ScoreSchema: Schema = new Schema({
  communicationActivity: { type: Number, required: true },
  speechFluency: { type: Number, required: true },
  politeness: { type: Number, required: true },
  engagement: { type: Number, required: true },
  overallImpression: { type: Number, required: true },
}, { _id: false });

const ParticipantSchema: Schema = new Schema({
  socketId: { type: String, required: true },
  username: { type: String, required: true },
  scores: { type: ScoreSchema, required: true },
  totalScore: { type: Number, required: true },
}, { _id: false });

const EvaluationSchema: Schema = new Schema({
  participants: { type: [ParticipantSchema], required: true },
  winnerSocketId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Evaluation || mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);

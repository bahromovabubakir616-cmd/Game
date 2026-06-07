import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email?: string;
  username: string;
  avatar: string;
  isPremium: boolean;
  gender?: string;
  country: string;
  bannedUntil?: Date;
  friends: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  username: { type: String, required: true },
  avatar: { type: String, default: '' },
  isPremium: { type: Boolean, default: false },
  gender: { type: String },
  country: { type: String, default: 'Unknown' },
  bannedUntil: { type: Date },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

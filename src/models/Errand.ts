import mongoose, { Schema, Document } from 'mongoose';

export interface IRecurring {
  enabled: boolean;
  intervalDays: number;
  nextDue: Date;
}

export interface IErrand extends Document {
  title: string;
  category: string;
  linkedPlaceId: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  recurring: IRecurring;
  status: 'pending' | 'done';
  completedAt: Date;
  completedAtPlaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const errandSchema = new Schema<IErrand>(
  {
    title: {
      type: String,
      required: [true, 'Errand title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      trim: true,
    },
    linkedPlaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Place',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    deadline: {
      type: Date,
    },
    recurring: {
      type: {
        enabled: { type: Boolean, default: false },
        intervalDays: { type: Number },
        nextDue: { type: Date },
      },
    },
    status: {
      type: String,
      enum: ['pending', 'done'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
    },
    completedAtPlaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Place',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IErrand>('Errand', errandSchema);

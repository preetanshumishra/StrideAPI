import mongoose, { Schema, Document } from 'mongoose';

export interface IPlace extends Document {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  tags: string[];
  notes: string;
  personalRating: number;
  collectionId: mongoose.Types.ObjectId;
  visitCount: number;
  lastVisited: Date;
  source: 'manual' | 'auto-suggested' | 'from-errand';
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const placeSchema = new Schema<IPlace>(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    category: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    personalRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Collection',
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    lastVisited: {
      type: Date,
    },
    source: {
      type: String,
      enum: ['manual', 'auto-suggested', 'from-errand'],
      default: 'manual',
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

export default mongoose.model<IPlace>('Place', placeSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  description: string;
  roomType: string;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  capacity: number;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, 'Please add a room name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    roomType: {
      type: String,
      required: [true, 'Please specify room type'],
      enum: ['standard', 'deluxe', 'suite', 'family']
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please add a daily price']
    },
    pricePerWeek: {
      type: Number,
      required: [true, 'Please add a weekly price']
    },
    pricePerMonth: {
      type: Number,
      required: [true, 'Please add a monthly price']
    },
    capacity: {
      type: Number,
      required: [true, 'Please add room capacity'],
      min: [1, 'Capacity must be at least 1']
    },
    images: {
      type: [String],
      required: [true, 'Please add at least one image URL'],
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'Please add at least one image URL'
      }
    },
    amenities: {
      type: [String],
      required: [true, 'Please add room amenities']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

export default mongoose.model<IRoom>('Room', RoomSchema);
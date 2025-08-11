import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBooking extends Document {
  bookingId: string;
  user: mongoose.Schema.Types.ObjectId;
  room: mongoose.Schema.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  bookingType: 'daily' | 'weekly' | 'monthly';
  totalAmount: number;
  discountApplied: number;
  finalAmount: number;
  status: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid';
  guestDetails: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    idProof?: string;
  };
  specialRequests?: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: {
      type: String,
      default: () => `BK-${uuidv4().substring(0, 8).toUpperCase()}`,
      unique: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    checkInDate: {
      type: Date,
      required: [true, 'Please provide check-in date']
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Please provide check-out date']
    },
    bookingType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: [true, 'Please specify booking type']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please specify total amount']
    },
    discountApplied: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      required: [true, 'Please specify final amount']
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'cancelled', 'completed'],
      default: 'draft'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    guestDetails: {
      name: {
        type: String,
        required: [true, 'Please provide guest name']
      },
      email: {
        type: String,
        required: [true, 'Please provide guest email'],
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      phone: {
        type: String,
        required: [true, 'Please provide guest phone number']
      },
      address: String,
      idProof: String
    },
    specialRequests: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

BookingSchema.pre('save', function(next) {
  if (this.checkOutDate <= this.checkInDate) {
    const error = new Error('Check-out date must be after check-in date');
    return next(error);
  }
  next();
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
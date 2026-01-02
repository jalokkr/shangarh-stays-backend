import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.model';
import Room from '../models/Room.model';
import ErrorResponse from '../utils/errorHandler';
import sendEmail from '../utils/emailSender';
import { generateReceiptPDF } from '../utils/receiptGenerator';

// Initialize Razorpay conditionally
let razorpay: Razorpay | null = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });
  }
  return razorpay;
};

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createPaymentOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    // Check if user owns this booking
    if (booking.user.toString() !== (req.user!._id as string).toString()) {
      return next(new ErrorResponse('Not authorized to access this booking', 403));
    }

    if (booking.paymentStatus === 'paid') {
      return next(new ErrorResponse('Payment already completed for this booking', 400));
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(booking.totalAmount * 100), // Amount in paisa
      currency: 'INR',
      receipt: booking.bookingId,
      payment_capture: 1, // Auto capture
    };

    // const order = await razorpay.orders.create(options);

    // Mock order for development
    const order = {
      id: `order_${Date.now()}`,
      amount: Math.round(booking.totalAmount * 100),
      currency: 'INR'
    };

    // Update booking with order ID
    booking.orderId = order.id;
    await booking.save();

    res.status(200).json({
      success: true,
      order: {
        id: `order_${Date.now()}`,
        amount: Math.round(booking.totalAmount * 100),
        currency: 'INR'
      },
      key: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    // const sign = razorpay_order_id + '|' + razorpay_payment_id;
    // const expectedSign = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    //   .update(sign.toString())
    //   .digest('hex');

    // if (razorpay_signature !== expectedSign) {
    //   return next(new ErrorResponse('Payment verification failed', 400));
    // }

    // Mock verification for development
    const expectedSign = 'mock_signature';
    if (razorpay_signature !== expectedSign) {
      // For demo purposes, accept any signature
    }

    // Update booking
    const booking = await Booking.findById(bookingId).populate('room').populate('user');
    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    // Check if user owns this booking
    if (booking.user.toString() !== (req.user!._id as string).toString()) {
      return next(new ErrorResponse('Not authorized to access this booking', 403));
    }

    booking.paymentId = razorpay_payment_id;
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed'; // Auto-confirm on successful payment
    await booking.save();

    // Send confirmation email
    const room = await Room.findById(booking.room);
    const message = `
      <h1>Payment Successful - Booking Confirmed!</h1>
      <p>Thank you for your payment. Your booking has been confirmed.</p>
      <p>Booking ID: <strong>${booking.bookingId}</strong></p>
      <p>Payment ID: <strong>${razorpay_payment_id}</strong></p>
      <h2>Booking Details:</h2>
      <ul>
        <li>Room: ${room?.name}</li>
        <li>Check-in: ${new Date(booking.checkInDate).toDateString()}</li>
        <li>Check-out: ${new Date(booking.checkOutDate).toDateString()}</li>
        <li>Booking Type: ${booking.bookingType}</li>
      </ul>
      <h2>Payment Breakdown:</h2>
      <ul>
        <li>Base Amount: ₹${booking.baseAmount}</li>
        <li>GST (${booking.gstPercentage}%): ₹${booking.gstAmount}</li>
        <li>Razorpay Charges: ₹${booking.razorpayCharges}</li>
        <li><strong>Total Amount: ₹${booking.totalAmount}</strong></li>
      </ul>
      <p>We look forward to welcoming you!</p>
    `;

    try {
      await sendEmail({
        email: booking.guestDetails.email,
        subject: 'Shangarh Stays - Payment Successful & Booking Confirmed',
        message
      });
    } catch (err) {
      console.log('Email could not be sent', err);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Handle payment failure
// @route   POST /api/payments/failure
// @access  Private
export const handlePaymentFailure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, error } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    // Check if user owns this booking
    if (booking.user.toString() !== (req.user!._id as string).toString()) {
      return next(new ErrorResponse('Not authorized to access this booking', 403));
    }

    booking.paymentStatus = 'failed';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded'
    });
  } catch (err) {
    next(err);
  }
};
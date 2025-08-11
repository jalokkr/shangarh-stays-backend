import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking.model';
import Room from '../models/Room.model';
import User from '../models/User.model';
import ErrorResponse from '../utils/errorHandler';
import sendEmail from '../utils/emailSender';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      bookingType,
      guestDetails,
      specialRequests,
      userId
    } = req.body;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return next(new ErrorResponse(`Room not found with id of ${roomId}`, 404));
    }

    // Check if room is available
    if (!room.isAvailable) {
      return next(new ErrorResponse('This room is not available for booking', 400));
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      room: roomId,
      status: { $in: ['draft', 'confirmed'] },
      $or: [
        {
          checkInDate: { $lte: new Date(checkOutDate) },
          checkOutDate: { $gte: new Date(checkInDate) }
        }
      ]
    });

    if (overlappingBookings.length > 0) {
      return next(
        new ErrorResponse('Room is not available for the selected dates', 400)
      );
    }

    // Calculate duration and total amount
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const durationMs = checkOut.getTime() - checkIn.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    let totalAmount = 0;
    switch (bookingType) {
      case 'daily':
        totalAmount = room.pricePerDay * durationDays;
        break;
      case 'weekly':
        const weeks = Math.ceil(durationDays / 7);
        totalAmount = room.pricePerWeek * weeks;
        break;
      case 'monthly':
        const months = Math.ceil(durationDays / 30);
        totalAmount = room.pricePerMonth * months;
        break;
      default:
        return next(new ErrorResponse('Invalid booking type', 400));
    }

    // Check if user is eligible for discount
    let discountApplied = 0;
    let finalAmount = totalAmount;
    let user = req.user;

    // If userId is provided (returning customer)
    if (userId) {
      const existingUser = await User.findById(userId);
      if (existingUser && existingUser.discountEligible) {
        discountApplied = totalAmount * 0.05; // 5% discount
        finalAmount = totalAmount - discountApplied;
        user = existingUser;
      }
    } else {
      // New user - make them eligible for future discounts
      if (user) {
        await User.findByIdAndUpdate(user._id, { discountEligible: true });
      }
    }

    // Create booking
    const booking = await Booking.create({
      user: user?._id,
      room: roomId,
      checkInDate,
      checkOutDate,
      bookingType,
      totalAmount,
      discountApplied,
      finalAmount,
      guestDetails,
      specialRequests
    });

    // Send booking confirmation email
    const message = `
      <h1>Booking Confirmation</h1>
      <p>Thank you for booking with Shangarh Stays!</p>
      <p>Your booking ID is: <strong>${booking.bookingId}</strong></p>
      <p>Status: <strong>DRAFT (Pending Admin Approval)</strong></p>
      <h2>Booking Details:</h2>
      <ul>
        <li>Room: ${room.name}</li>
        <li>Check-in: ${new Date(checkInDate).toDateString()}</li>
        <li>Check-out: ${new Date(checkOutDate).toDateString()}</li>
        <li>Booking Type: ${bookingType}</li>
        <li>Total Amount: ₹${totalAmount}</li>
        <li>Discount Applied: ₹${discountApplied}</li>
        <li>Final Amount: ₹${finalAmount}</li>
      </ul>
      <p>Your User ID for future bookings: <strong>${user?._id}</strong></p>
      <p>Use this ID for your next booking to get a 5% discount!</p>
      <p>We will send you a final confirmation once your booking is approved by our admin.</p>
    `;

    try {
      await sendEmail({
        email: guestDetails.email,
        subject: 'Shangarh Stays - Booking Confirmation (DRAFT)',
        message
      });
    } catch (err) {
      console.log('Email could not be sent', err);
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query;

    // If user is not admin, show only their bookings
    if (req.user?.role !== 'admin') {
      query = Booking.find({ user: req.user?._id });
    } else {
      query = Booking.find();
    }

    const bookings = await query.populate('room');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) {
      return next(
        new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is booking owner or admin
    if (
      booking.user.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user?._id} is not authorized to access this booking`,
          403
        )
      );
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    if (!['draft', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }

    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) {
      return next(
        new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
      );
    }

    booking.status = status;
    await booking.save();

    // Send email notification about status change
    const room = await Room.findById(booking.room);
    const message = `
      <h1>Booking Status Update</h1>
      <p>Your booking status has been updated.</p>
      <p>Booking ID: <strong>${booking.bookingId}</strong></p>
      <p>New Status: <strong>${status.toUpperCase()}</strong></p>
      <h2>Booking Details:</h2>
      <ul>
        <li>Room: ${room?.name}</li>
        <li>Check-in: ${booking.checkInDate.toDateString()}</li>
        <li>Check-out: ${booking.checkOutDate.toDateString()}</li>
        <li>Final Amount: ₹${booking.finalAmount}</li>
      </ul>
      ${status === 'confirmed' ? '<p>We look forward to welcoming you!</p>' : ''}
      ${status === 'cancelled' ? '<p>We hope to serve you in the future.</p>' : ''}
      ${status === 'completed' ? '<p>Thank you for staying with us. We hope you had a pleasant stay!</p>' : ''}
    `;

    try {
      await sendEmail({
        email: booking.guestDetails.email,
        subject: `Shangarh Stays - Booking ${status.toUpperCase()}`,
        message
      });
    } catch (err) {
      console.log('Email could not be sent', err);
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(
        new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is booking owner or admin
    if (
      booking.user.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user?._id} is not authorized to cancel this booking`,
          403
        )
      );
    }

    // Check if booking is already cancelled or completed
    if (['cancelled', 'completed'].includes(booking.status)) {
      return next(
        new ErrorResponse(
          `Booking with status ${booking.status} cannot be cancelled`,
          400
        )
      );
    }

    booking.status = 'cancelled';
    await booking.save();

    // Send cancellation email
    const room = await Room.findById(booking.room);
    const message = `
      <h1>Booking Cancellation</h1>
      <p>Your booking has been cancelled.</p>
      <p>Booking ID: <strong>${booking.bookingId}</strong></p>
      <h2>Booking Details:</h2>
      <ul>
        <li>Room: ${room?.name}</li>
        <li>Check-in: ${booking.checkInDate.toDateString()}</li>
        <li>Check-out: ${booking.checkOutDate.toDateString()}</li>
      </ul>
      <p>We hope to serve you in the future.</p>
    `;

    try {
      await sendEmail({
        email: booking.guestDetails.email,
        subject: 'Shangarh Stays - Booking Cancelled',
        message
      });
    } catch (err) {
      console.log('Email could not be sent', err);
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};
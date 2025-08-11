import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking.model';
import Room from '../models/Room.model';
import User from '../models/User.model';
import ErrorResponse from '../utils/errorHandler';


export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find({ status: 'confirmed' });
    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.finalAmount, 0);
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const draftBookings = await Booking.countDocuments({ status: 'draft' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ isAvailable: true });

    const totalUsers = await User.countDocuments({ role: 'user' });

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('room', 'name');

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          draft: draftBookings,
          cancelled: cancelledBookings,
          completed: completedBookings
        },
        rooms: {
          total: totalRooms,
          available: availableRooms
        },
        users: {
          total: totalUsers
        },
        recentBookings
      }
    });
  } catch (err) {
    next(err);
  }
};


export const getRevenueReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    const bookings = await Booking.find({
      ...dateFilter,
      status: 'confirmed'
    }).populate('room', 'name');

    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.finalAmount, 0);

    const roomTypeRevenue: Record<string, number> = {};
    for (const booking of bookings) {
      const room = await Room.findById(booking.room);
      if (room) {
        if (!roomTypeRevenue[room.roomType]) {
          roomTypeRevenue[room.roomType] = 0;
        }
        roomTypeRevenue[room.roomType] += booking.finalAmount;
      }
    }

    const bookingTypeRevenue = {
      daily: 0,
      weekly: 0,
      monthly: 0
    };

    for (const booking of bookings) {
      bookingTypeRevenue[booking.bookingType] += booking.finalAmount;
    }

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        bookingsCount: bookings.length,
        roomTypeRevenue,
        bookingTypeRevenue,
        bookings
      }
    });
  } catch (err) {
    next(err);
  }
};


export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};


export const createAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};


export const getPendingBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find({ status: 'draft' })
      .populate('room', 'name')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};
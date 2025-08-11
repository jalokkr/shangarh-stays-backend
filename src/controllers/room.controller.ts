import { Request, Response, NextFunction } from 'express';
import Room, { IRoom } from '../models/Room.model';
import Booking from '../models/Booking.model';
import ErrorResponse from '../utils/errorHandler';


export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await Room.find();

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

export const getRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};


export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};


export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};


export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    const activeBookings = await Booking.find({
      room: req.params.id,
      status: { $in: ['draft', 'confirmed'] }
    });

    if (activeBookings.length > 0) {
      return next(
        new ErrorResponse(
          `Cannot delete room with active bookings. Please cancel all bookings first.`,
          400
        )
      );
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};


export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return next(
        new ErrorResponse('Please provide roomId, checkInDate and checkOutDate', 400)
      );
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return next(new ErrorResponse(`Room not found with id of ${roomId}`, 404));
    }

    if (!room.isAvailable) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'This room is currently not available for booking.'
      });
    }

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

    const isAvailable = overlappingBookings.length === 0;

    res.status(200).json({
      success: true,
      available: isAvailable,
      message: isAvailable
        ? 'Room is available for the selected dates'
        : 'Room is not available for the selected dates'
    });
  } catch (err) {
    next(err);
  }
};
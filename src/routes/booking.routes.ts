import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking
} from '../controllers/booking.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/').get(protect, getBookings).post(protect, createBooking);

router.route('/:id').get(protect, getBooking);

router.route('/:id/status').put(protect, authorize('admin'), updateBookingStatus);

router.route('/:id/cancel').put(protect, cancelBooking);

export default router;
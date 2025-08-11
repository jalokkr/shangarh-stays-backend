import express from 'express';
import {
  getDashboardStats,
  getRevenueReport,
  getUsers,
  createAdminUser,
  getPendingBookings
} from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Apply middleware to all routes
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueReport);
router.route('/users').get(getUsers).post(createAdminUser);
router.get('/bookings/pending', getPendingBookings);

export default router;
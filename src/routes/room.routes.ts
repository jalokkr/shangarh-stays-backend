import express from 'express';
import {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  checkAvailability
} from '../controllers/room.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/').get(getRooms).post(protect, authorize('admin'), createRoom);

router
  .route('/:id')
  .get(getRoom)
  .put(protect, authorize('admin'), updateRoom)
  .delete(protect, authorize('admin'), deleteRoom);

router.post('/check-availability', checkAvailability);

export default router;
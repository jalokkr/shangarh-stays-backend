import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure
} from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/failure', handlePaymentFailure);

export default router;
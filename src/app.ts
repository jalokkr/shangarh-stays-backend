import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import bookingRoutes from './routes/booking.routes';
import adminRoutes from './routes/admin.routes';

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Shangarh Stays API is running');
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default app;

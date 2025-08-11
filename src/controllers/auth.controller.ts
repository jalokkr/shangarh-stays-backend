import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User.model';
import ErrorResponse from '../utils/errorHandler';
import sendEmail from '../utils/emailSender';


export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const message = `
      <h1>Welcome to Shangarh Stays!</h1>
      <p>Thank you for registering with us. We're excited to have you as our guest.</p>
      <p>Your user ID is: ${user._id}</p>
      <p>You can use this ID for future bookings to get a 5% discount.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to Shangarh Stays',
        message
      });
    } catch (err) {
      console.log('Email could not be sent', err);
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};


export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};


export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      discountEligible: user.discountEligible
    }
  });
};
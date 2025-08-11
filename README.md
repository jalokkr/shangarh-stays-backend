# Shangarh Stays Backend

Backend API for the Shangarh Stays hotel booking platform. This API provides endpoints for user authentication, room management, booking management, and admin functionalities.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- JWT Authentication

## Features

### User Features
- User registration and authentication
- Browse available rooms
- Check room availability for specific dates
- Make bookings with different pricing options (daily, weekly, monthly)
- View booking history
- Cancel bookings
- Receive booking confirmations and updates via email
- Get 5% discount on future bookings

### Admin Features
- Approve or reject booking requests
- Add, update, and delete rooms
- View all bookings and their statuses
- View revenue reports and statistics
- Manage users
- Dashboard with key metrics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Create new room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)
- `DELETE /api/rooms/:id` - Delete room (Admin only)
- `POST /api/rooms/check-availability` - Check room availability

### Bookings
- `GET /api/bookings` - Get all bookings (User: own bookings, Admin: all bookings)
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status (Admin only)
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/revenue` - Get revenue report
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create admin user
- `GET /api/admin/bookings/pending` - Get pending bookings

## Setup and Installation

1. Clone the repository
   ```
   git clone https://github.com/jalokkr/shangarh-stays-backend.git
   cd shangarh-stays-backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   FROM_EMAIL=your_email@gmail.com
   FRONTEND_URL=http://localhost:3000
   ```

4. Run the development server
   ```
   npm run dev
   ```

5. Build for production
   ```
   npm run build
   ```

6. Run in production
   ```
   npm start
   ```

## License

ISC
import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';

dotenv.config();


async function start() {
  try {
    await connectDB();  

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.model';
import Room from '../models/Room.model';

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI as string);

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    discountEligible: true
  }
];

const rooms = [
  {
    name: 'Deluxe Mountain View Room',
    description: 'Spacious room with stunning mountain views, perfect for couples or solo travelers.',
    roomType: 'deluxe',
    pricePerDay: 3500,
    pricePerWeek: 21000,
    pricePerMonth: 80000,
    capacity: 2,
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061'
    ],
    amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mountain View', 'Private Bathroom'],
    isAvailable: true
  },
  {
    name: 'Family Suite',
    description: 'Large suite with separate living area, ideal for families or groups.',
    roomType: 'family',
    pricePerDay: 5500,
    pricePerWeek: 33000,
    pricePerMonth: 120000,
    capacity: 4,
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843'
    ],
    amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Kitchen', 'Living Area', 'Private Bathroom'],
    isAvailable: true
  },
  {
    name: 'Standard Valley View Room',
    description: 'Cozy room with beautiful valley views, perfect for budget travelers.',
    roomType: 'standard',
    pricePerDay: 2500,
    pricePerWeek: 15000,
    pricePerMonth: 55000,
    capacity: 2,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'
    ],
    amenities: ['Free WiFi', 'Valley View', 'Private Bathroom'],
    isAvailable: true
  },
  {
    name: 'Luxury Suite',
    description: 'Premium suite with panoramic views and luxury amenities.',
    roomType: 'suite',
    pricePerDay: 7500,
    pricePerWeek: 45000,
    pricePerMonth: 160000,
    capacity: 2,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf'
    ],
    amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Panoramic View', 'Jacuzzi', 'Mini Bar', 'Private Terrace'],
    isAvailable: true
  }
];

// Import data into DB
const importData = async () => {
  try {
    await User.deleteMany();
    await Room.deleteMany();

    await User.create(users);
    await Room.create(rooms);

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Room.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Command line args
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use correct command: -i (import) or -d (delete)');
  process.exit();
}
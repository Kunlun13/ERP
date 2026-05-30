import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import AcademicSession from '../models/AcademicSession.js';
import SchoolSettings from '../models/SchoolSettings.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await AcademicSession.deleteMany({});
    await SchoolSettings.deleteMany({});

    const admin = await User.create({
      name: 'Admin Teacher',
      email: 'admin@school.com',
      mobileNo: '9876543210',
      password: 'admin123',
      role: ROLES.ADMIN,
    });

    const session = await AcademicSession.create({
      name: '2025-2026',
      startYear: 2025,
      endYear: 2026,
      isActive: true,
      createdBy: admin._id,
    });

    await SchoolSettings.create({
      sessionId: session._id,
      schoolName: 'Demo Public School',
      address: '123 Education Lane, City',
      contact: '+91 9876543210',
      classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      sections: ['A', 'B', 'C'],
    });

    console.log('Seed completed!');
    console.log('Login: admin@school.com / admin123');
    console.log(`Session: ${session.name}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();

require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await DoctorProfile.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bracu.ac.bd',
      password: 'Admin@123',
      role: 'ADMIN',
      isEmailVerified: true,
    });

    console.log('✅ Admin created:', admin.email);

    // Create sample doctors
    const doctor1 = await User.create({
      name: 'Dr. Sarah Ahmed',
      email: 'doctor1@example.com',
      password: 'Doctor@123',
      role: 'DOCTOR',
      isEmailVerified: true,
    });

    await DoctorProfile.create({
      userId: doctor1._id,
      specialization: 'Cardiology',
      experienceYears: 10,
      fee: 1500,
      bio: 'Experienced cardiologist with expertise in heart disease prevention and treatment.',
      licenseNo: 'BMDC-12345',
      verificationStatus: 'VERIFIED',
    });

    const doctor2 = await User.create({
      name: 'Dr. Mohammed Rahman',
      email: 'doctor2@example.com',
      password: 'Doctor@123',
      role: 'DOCTOR',
      isEmailVerified: true,
    });

    await DoctorProfile.create({
      userId: doctor2._id,
      specialization: 'Pediatrics',
      experienceYears: 8,
      fee: 1200,
      bio: 'Specialized in child healthcare and development. Caring for children is my passion.',
      licenseNo: 'BMDC-23456',
      verificationStatus: 'VERIFIED',
    });

    const doctor3 = await User.create({
      name: 'Dr. Fatima Khan',
      email: 'doctor3@example.com',
      password: 'Doctor@123',
      role: 'DOCTOR',
      isEmailVerified: true,
    });

    await DoctorProfile.create({
      userId: doctor3._id,
      specialization: 'Dermatology',
      experienceYears: 6,
      fee: 1000,
      bio: 'Expert in skin conditions, acne treatment, and cosmetic dermatology.',
      licenseNo: 'BMDC-34567',
      verificationStatus: 'PENDING',
    });

    console.log('✅ Doctors created');

    // Create sample patients
    const patient1 = await User.create({
      name: 'John Doe',
      email: 'patient1@example.com',
      password: 'Patient@123',
      role: 'PATIENT',
      isEmailVerified: true,
    });

    const patient2 = await User.create({
      name: 'Jane Smith',
      email: 'patient2@example.com',
      password: 'Patient@123',
      role: 'PATIENT',
      isEmailVerified: true,
    });

    console.log('✅ Patients created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('Admin:    admin@bracu.ac.bd / Admin@123');
    console.log('Doctor:   doctor1@example.com / Doctor@123');
    console.log('Patient:  patient1@example.com / Patient@123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();

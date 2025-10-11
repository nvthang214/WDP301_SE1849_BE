import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Role from '../src/models/Role.js';
import User from '../src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wdp301';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Ensure roles exist
    const roles = ['admin', 'user', 'recruiter', 'guest'];
    for (const roleName of roles) {
      const existing = await Role.findOne({ name: roleName });
      if (!existing) {
        await Role.create({ name: roleName });
        console.log(`Created role: ${roleName}`);
      }
    }

    // Ensure admin user exists
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    let adminRole = await Role.findOne({ name: 'admin' });

    if (!adminRole) {
      adminRole = await Role.create({ name: 'admin' });
    }

    const existingAdmin = await User.findOne({ Email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists:', adminEmail);
    } else {
      const adminUser = new User({
        Email: adminEmail,
        Password: adminPassword,
        FullName: 'Admin User',
        Role: 'admin',
        role_id: adminRole._id,
        IsActive: true
      });
      await adminUser.save();
      console.log('Created admin user:', adminEmail);
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();

import mongoose from 'mongoose';
import Role from './src/models/Role.js';

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed roles
const seedRoles = async () => {
  try {
    const roles = ['admin', 'candidate', 'recruiter'];
    
    for (const roleName of roles) {
      const existingRole = await Role.findOne({ name: roleName });
      if (!existingRole) {
        await Role.create({ name: roleName });
        console.log(`Created role: ${roleName}`);
      } else {
        console.log(`Role ${roleName} already exists`);
      }
    }
    
    console.log('Roles seeding completed');
  } catch (error) {
    console.error('Error seeding roles:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await seedRoles();
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

main().catch(console.error);

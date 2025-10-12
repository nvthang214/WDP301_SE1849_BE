<<<<<<< HEAD
// db.js
=======
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedRoles } from "./seadingData.js";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    // Gọi hàm seeding data ở đây nếu cần
    await seedRoles();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

<<<<<<< HEAD
export default connectDB;
=======
export default connectDB;
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d

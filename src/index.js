import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './databases/databaseConnect.js';
import { errorHandler } from './middlewares/error.middleware.js';
import appRoutes from './routes/app.routes.js';

dotenv.config();
const app = express();

// Middleware setup
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Connect to the database
connectDB();

// Routes
app.use('/api', appRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

export default app;

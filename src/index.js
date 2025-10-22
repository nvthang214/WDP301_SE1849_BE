import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./databases/databaseConnect.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import appRoutes from "./routes/app.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// Middleware setup
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies
app.use(express.json());
app.use(cookieParser());
// Connect to the database
connectDB();
app.get("/api/sync", (req, res) => {
  // Sync logic here
  res.status(200).json({ message: "Sync successful" });
});

// Routes
app.use("/api", appRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

export default app;

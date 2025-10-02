import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const generateToken = (userId) => {
  if (!userId) {
    throw new Error("User ID is required to generate a token");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

export default generateToken;

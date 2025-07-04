import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  console.log("🔐 Token verification request:");
  console.log(
    "- Authorization header:",
    token ? `Bearer ${token.slice(-10)}...` : "Missing"
  );

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const cleanToken = token.replace("Bearer ", "");
  console.log("- Clean token length:", cleanToken.length);
  console.log("- JWT_SECRET available:", !!process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    console.log("✅ Token verified for user:", decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export const optionalAuth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return next();
  }

  const cleanToken = token.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return next();
  }
};

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
};

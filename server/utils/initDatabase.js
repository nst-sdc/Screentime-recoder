import mongoose from "mongoose";
import Category from "../models/category.model.js";
import dotenv from "dotenv";

dotenv.config();

const initializeDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("Initializing system categories...");
    await Category.initializeSystemCategories();
    console.log("System categories initialized");

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export default initializeDatabase;

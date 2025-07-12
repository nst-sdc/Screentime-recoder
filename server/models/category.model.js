import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String
    },
    color: {
      type: String,
      default: "#6B7280"
    },
    icon: {
      type: String,
      default: "🌐"
    },
    isSystemCategory: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

categorySchema.statics.initializeSystemCategories = async function() {
  const systemCategories = [
    {
      name: "Work",
      description: "Professional and work-related activities",
      color: "#3B82F6",
      icon: "💼",
      isSystemCategory: true
    },
    {
      name: "Social Media",
      description: "Social networking platforms",
      color: "#EC4899",
      icon: "SM",
      isSystemCategory: true
    },
    {
      name: "Entertainment",
      description: "Videos, movies, games, and fun content",
      color: "#F59E0B",
      icon: "ENT",
      isSystemCategory: true
    },
    {
      name: "Education",
      description: "Learning, courses, and educational content",
      color: "#10B981",
      icon: "EDU",
      isSystemCategory: true
    },
    {
      name: "News",
      description: "News websites and current affairs",
      color: "#EF4444",
      icon: "NEWS",
      isSystemCategory: true
    },
    {
      name: "Shopping",
      description: "E-commerce and online shopping",
      color: "#8B5CF6",
      icon: "SHOP",
      isSystemCategory: true
    },
    {
      name: "Communication",
      description: "Email, messaging, and communication tools",
      color: "#06B6D4",
      icon: "COMM",
      isSystemCategory: true
    },
    {
      name: "Development",
      description: "Programming, coding, and development tools",
      color: "#059669",
      icon: "DEV",
      isSystemCategory: true
    },
    {
      name: "Health & Fitness",
      description: "Health, fitness, and wellness content",
      color: "#DC2626",
      icon: "HEALTH",
      isSystemCategory: true
    },
    {
      name: "Finance",
      description: "Banking, investing, and financial services",
      color: "#065F46",
      icon: "FIN",
      isSystemCategory: true
    },
    {
      name: "Productivity",
      description: "Tools and apps for productivity",
      color: "#7C3AED",
      icon: "PROD",
      isSystemCategory: true
    },
    {
      name: "Unknown",
      description: "Uncategorized or unidentified content",
      color: "#6B7280",
      icon: "UNK",
      isSystemCategory: true
    }
  ];

  for (const category of systemCategories) {
    await this.findOneAndUpdate(
      { name: category.name, isSystemCategory: true },
      category,
      { upsert: true, new: true }
    );
  }
};

const Category = mongoose.model("Category", categorySchema);
export default Category;

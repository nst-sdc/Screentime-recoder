import mongoose from "mongoose";
import User from "../models/user.model.js";

// Create a new user
export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all the fields" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists with this email" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error(`Create User Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update an existing user by ID
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(`Update User Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(`Delete User Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get logged-in user's profile info
export const getUserProfile = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

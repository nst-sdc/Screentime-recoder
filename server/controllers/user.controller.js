import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createUser = async (req, res) => {
  const user = req.body;

  if (!user.name || !user.email || !user.password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all the fields" });
  }

  const newUser = new User(user);

  try {
    await newUser.save();
    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }

  res.status(201).json({ message: "User created successfully" });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;

  const userUpdates = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, userUpdates, {
      new: true
    });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(404).json({ success: false, message: "User not found" });
  }
};

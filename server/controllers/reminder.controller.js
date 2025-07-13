import Reminder from "../models/reminder.model.js";

export const addReminder = async (req, res) => {
  try {
    const newReminder = new Reminder({
      ...req.body,
      userId: req.user.id
    });

    await newReminder.save();
    res.status(201).json({ reminder: newReminder });
  } catch (error) {
    console.error("Error adding reminder:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({
      createdAt: -1
    });
    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error getting reminders:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Reminder deleted" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).json({ error: error.message });
  }
};

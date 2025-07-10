import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  type: {
    type: String,
    enum: ["alert", "block", "custom"],
    required: true,
  },

  // alert + block + custom
  reminderName: { type: String },
  message: { type: String, default: "" },

  // Target (used in alert + block)
  targetType: { type: String, enum: ["category", "domain"], default: "domain" },
  targetValue: { type: String },

  // Main time to trigger the reminder (used in all types) 
  hours: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
  seconds: { type: Number, default: 0 },

  // Notification types
  notificationTypes: {
    type: [String],
    enum: ["browser", "sound"],
    default: ["browser"],
  },

  // Repeat configuration for alert-type
  repeatOption: {
    type: String,
    enum: ["never", "hourly", "10min", "custom"],
    default: "never",
  },
  customRepeatHours: { type: Number, default: 0 },
  customRepeatMinutes: { type: Number, default: 0 },
  customRepeatSeconds: { type: Number, default: 0 },

  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;

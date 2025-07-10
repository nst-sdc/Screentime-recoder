import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    tabId: {
      type: Number
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    url: {
      type: String,
      required: true
    },
    domain: {
      type: String,
      required: true
    },
    title: {
      type: String
    },
    startTime: {
      type: Date,
      default: Date.now
    sessionId: {
      type: String,
      required: false
    },
    startTime: {
      type: Date,
      required: false
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number,
      default: 0 // in milliseconds
    },
    action: {
      type: String,
      enum: ["visit", "start", "update", "end", "close"],
      enum: ["start", "update", "end", "visit", "focus", "blur", "close", "idle"],
      default: "visit"
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;

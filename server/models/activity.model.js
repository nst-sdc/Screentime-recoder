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

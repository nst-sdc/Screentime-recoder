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
    tabName: {
      type: String,
      required: false
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
      default: 0
    },
    action: {
      type: String,
      enum: ["visit", "start", "update", "end", "close"],
      default: "visit"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    idleTime: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ userId: 1, domain: 1, startTime: -1 });
activitySchema.index({ sessionId: 1 });
activitySchema.index({ userId: 1, isActive: 1 });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;

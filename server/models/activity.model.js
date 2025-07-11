import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    url: {
      type: String,
      required: true
    },
    tabId: {
      type: Number,
      required: true
    },
    tabName: {
      type: String,
      required: false
    },
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
      default: 0
    },
    domain: {
      type: String,
      required: true
    },
    title: {
      type: String
    },
    action: {
      type: String,
      enum: ["start", "update", "end", "visit", "focus", "blur", "close", "idle"],
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

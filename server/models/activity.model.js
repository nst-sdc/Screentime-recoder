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
      type: Number, // Total active time in milliseconds
      default: 0
    },
    domain: {
      type: String,
      required: true
    },
    title: {
      type: String // Page title
    },
    action: {
      type: String,
      enum: ["start", "update", "end", "visit", "focus", "blur", "close", "idle"],
      default: "visit"
    },
    isActive: {
      type: Boolean,
      default: true // Whether this session is currently active
    },
    idleTime: {
      type: Number, // Time spent idle in milliseconds
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
activitySchema.index({ userId: 1, domain: 1, startTime: -1 });
activitySchema.index({ sessionId: 1 });
activitySchema.index({ userId: 1, isActive: 1 });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;

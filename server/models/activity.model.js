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
    timestamp: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in milliseconds or seconds
      default: 0
    },
    domain: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;

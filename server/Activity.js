const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  action: {
    type: String,
    enum: ["visit", "click", "scroll", "input", "other"],
    default: "visit",
  },
});

module.exports = mongoose.model("Activity", activitySchema);

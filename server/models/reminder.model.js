import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["alert", "block", "custom"],
      required: true
    },
    reminderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      enum: ["category", "domain"],
      required: true
    },
    targetValue: {
      type: String,
      required: true
    },
    hours: {
      type: Number,
      default: 0,
      min: 0,
      max: 23
    },
    minutes: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    },
    seconds: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    },
    repeatOption: {
      type: String,
      enum: ["never", "hourly", "10min", "custom"],
      default: "never"
    },
    customRepeatHours: {
      type: Number,
      default: 0,
      min: 0,
      max: 23
    },
    customRepeatMinutes: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    },
    customRepeatSeconds: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    },
    notificationTypes: [
      {
        type: String,
        enum: ["browser", "sound"]
      }
    ],
    active: {
      type: Boolean,
      default: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    blockedDomains: [
      {
        domain: String,
        blockedAt: Date,
        blockedUntil: Date
      }
    ],
    totalDurationMs: {
      type: Number,
      default: 0
    },
    lastTriggered: {
      type: Date
    },
    nextTrigger: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Calculate total duration in milliseconds
reminderSchema.pre("save", function(next) {
  this.totalDurationMs =
    (this.hours * 3600 + this.minutes * 60 + this.seconds) * 1000;

  // Calculate next trigger time
  if (this.active && this.totalDurationMs > 0) {
    this.nextTrigger = new Date(Date.now() + this.totalDurationMs);
  }

  next();
});

// Instance method to check if reminder should trigger
reminderSchema.methods.shouldTrigger = function() {
  return this.active && this.nextTrigger && new Date() >= this.nextTrigger;
};

// Instance method to trigger reminder
reminderSchema.methods.trigger = function() {
  this.lastTriggered = new Date();

  // Calculate next trigger for repeating reminders
  if (this.repeatOption !== "never") {
    let repeatMs = 0;

    switch (this.repeatOption) {
      case "hourly":
        repeatMs = 3600000; // 1 hour
        break;
      case "10min":
        repeatMs = 600000; // 10 minutes
        break;
      case "custom":
        repeatMs =
          (this.customRepeatHours * 3600 +
            this.customRepeatMinutes * 60 +
            this.customRepeatSeconds) *
          1000;
        break;
    }

    if (repeatMs > 0) {
      this.nextTrigger = new Date(Date.now() + repeatMs);
    }
  } else {
    this.nextTrigger = null;
  }

  return this.save();
};

// Instance method to block domain
reminderSchema.methods.blockDomain = function(domain, durationMs = 0) {
  if (this.type === "block") {
    const blockEntry = {
      domain: domain,
      blockedAt: new Date(),
      blockedUntil: durationMs > 0 ? new Date(Date.now() + durationMs) : null
    };

    this.blockedDomains.push(blockEntry);
    this.isBlocked = true;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to unblock domain
reminderSchema.methods.unblockDomain = function(domain) {
  this.blockedDomains = this.blockedDomains.filter(
    block => block.domain !== domain
  );
  this.isBlocked = this.blockedDomains.length > 0;
  return this.save();
};

// Static method to get active reminders for user
reminderSchema.statics.getActiveReminders = function(userId) {
  return this.find({ userId, active: true }).sort({ createdAt: -1 });
};

// Static method to get reminders that should trigger
reminderSchema.statics.getTriggeredReminders = function(userId = null) {
  const query = {
    active: true,
    nextTrigger: { $lte: new Date() }
  };

  if (userId) {
    query.userId = userId;
  }

  return this.find(query);
};

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;

import Reminder from "../models/reminder.model.js";

// Get all reminders for a user
export const getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await Reminder.getActiveReminders(userId);

    res.status(200).json({
      success: true,
      data: reminders,
      count: reminders.length
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reminders",
      error: error.message
    });
  }
};

// Create a new reminder
export const createReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type,
      reminderName,
      message,
      targetType,
      targetValue,
      hours = 0,
      minutes = 0,
      seconds = 0,
      repeatOption = "never",
      customRepeatHours = 0,
      customRepeatMinutes = 0,
      customRepeatSeconds = 0,
      notificationTypes = ["browser"]
    } = req.body;

    // Validation
    if (!type || !message || !targetType || !targetValue) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: type, message, targetType, targetValue"
      });
    }

    if (hours === 0 && minutes === 0 && seconds === 0) {
      return res.status(400).json({
        success: false,
        message: "Please set a valid time duration"
      });
    }

    const reminder = new Reminder({
      userId,
      type,
      reminderName: reminderName || `${type} reminder`,
      message,
      targetType,
      targetValue,
      hours: parseInt(hours) || 0,
      minutes: parseInt(minutes) || 0,
      seconds: parseInt(seconds) || 0,
      repeatOption,
      customRepeatHours: parseInt(customRepeatHours) || 0,
      customRepeatMinutes: parseInt(customRepeatMinutes) || 0,
      customRepeatSeconds: parseInt(customRepeatSeconds) || 0,
      notificationTypes: Array.isArray(notificationTypes)
        ? notificationTypes
        : ["browser"],
      active: true
    });

    await reminder.save();

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder
    });
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create reminder",
      error: error.message
    });
  }
};

// Update a reminder
export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const reminder = await Reminder.findOne({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        reminder[key] = updateData[key];
      }
    });

    await reminder.save();

    res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      data: reminder
    });
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update reminder",
      error: error.message
    });
  }
};

// Delete a reminder
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete reminder",
      error: error.message
    });
  }
};

// Toggle reminder active status
export const toggleReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOne({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    reminder.active = !reminder.active;
    await reminder.save();

    res.status(200).json({
      success: true,
      message: `Reminder ${reminder.active
        ? "activated"
        : "deactivated"} successfully`,
      data: reminder
    });
  } catch (error) {
    console.error("Error toggling reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle reminder",
      error: error.message
    });
  }
};

// Trigger a reminder manually
export const triggerReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOne({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    await reminder.trigger();

    res.status(200).json({
      success: true,
      message: "Reminder triggered successfully",
      data: reminder
    });
  } catch (error) {
    console.error("Error triggering reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger reminder",
      error: error.message
    });
  }
};

// Block a domain
export const blockDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { domain, durationMs } = req.body;
    const userId = req.user.id;

    const reminder = await Reminder.findOne({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    if (reminder.type !== "block") {
      return res.status(400).json({
        success: false,
        message: "This reminder is not a block type"
      });
    }

    await reminder.blockDomain(domain, durationMs);

    res.status(200).json({
      success: true,
      message: "Domain blocked successfully",
      data: reminder
    });
  } catch (error) {
    console.error("Error blocking domain:", error);
    res.status(500).json({
      success: false,
      message: "Failed to block domain",
      error: error.message
    });
  }
};

// Unblock a domain
export const unblockDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { domain } = req.body;
    const userId = req.user.id;

    const reminder = await Reminder.findOne({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    await reminder.unblockDomain(domain);

    res.status(200).json({
      success: true,
      message: "Domain unblocked successfully",
      data: reminder
    });
  } catch (error) {
    console.error("Error unblocking domain:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unblock domain",
      error: error.message
    });
  }
};

// Get all blocked domains for user
export const getBlockedDomains = async (req, res) => {
  try {
    const userId = req.user.id;

    const reminders = await Reminder.find({
      userId,
      type: "block",
      isBlocked: true
    });

    const blockedDomains = [];
    reminders.forEach(reminder => {
      reminder.blockedDomains.forEach(block => {
        blockedDomains.push({
          reminderId: reminder._id,
          reminderName: reminder.reminderName,
          domain: block.domain,
          blockedAt: block.blockedAt,
          blockedUntil: block.blockedUntil,
          isActive: !block.blockedUntil || block.blockedUntil > new Date()
        });
      });
    });

    res.status(200).json({
      success: true,
      data: blockedDomains,
      count: blockedDomains.length
    });
  } catch (error) {
    console.error("Error fetching blocked domains:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blocked domains",
      error: error.message
    });
  }
};

// Check if domain is blocked
export const checkDomainBlocked = async (req, res) => {
  try {
    const { domain } = req.params;
    const userId = req.user.id;

    const reminders = await Reminder.find({
      userId,
      type: "block",
      isBlocked: true
    });

    let isBlocked = false;
    let blockInfo = null;

    for (const reminder of reminders) {
      const blockEntry = reminder.blockedDomains.find(block => {
        const normalizedDomain = domain.replace("www.", "").toLowerCase();
        const normalizedBlockDomain = block.domain
          .replace("www.", "")
          .toLowerCase();
        return (
          normalizedDomain.includes(normalizedBlockDomain) ||
          normalizedBlockDomain.includes(normalizedDomain)
        );
      });

      if (blockEntry) {
        const isStillBlocked =
          !blockEntry.blockedUntil || blockEntry.blockedUntil > new Date();
        if (isStillBlocked) {
          isBlocked = true;
          blockInfo = {
            reminderId: reminder._id,
            reminderName: reminder.reminderName,
            message: reminder.message,
            domain: blockEntry.domain,
            blockedAt: blockEntry.blockedAt,
            blockedUntil: blockEntry.blockedUntil
          };
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      isBlocked,
      blockInfo
    });
  } catch (error) {
    console.error("Error checking domain block:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check domain block",
      error: error.message
    });
  }
};

// Direct domain blocking (without reminder ID) - for extension use
export const blockDomainDirect = async (req, res) => {
  try {
    const { domain, duration, type = "manual" } = req.body;
    const userId = req.user.id;

    if (!domain || !duration) {
      return res.status(400).json({
        success: false,
        message: "Domain and duration are required"
      });
    }

    // Find or create a block-type reminder for this user
    let reminder = await Reminder.findOne({
      userId,
      type: "block",
      reminderName: "Extension Domain Blocking"
    });

    if (!reminder) {
      // Create a default block reminder
      reminder = new Reminder({
        userId,
        type: "block",
        reminderName: "Extension Domain Blocking",
        message: "Domain blocked via extension",
        targetType: "domain",
        targetValue: domain,
        hours: 1,
        minutes: 0,
        seconds: 0,
        repeatOption: "never",
        notificationTypes: ["browser"],
        active: true
      });
      await reminder.save();
    }

    // Block the domain
    await reminder.blockDomain(domain, duration);

    res.status(200).json({
      success: true,
      message: "Domain blocked successfully",
      data: {
        domain,
        duration,
        blockedAt: new Date(),
        blockedUntil: new Date(Date.now() + duration)
      }
    });
  } catch (error) {
    console.error("Error blocking domain directly:", error);
    res.status(500).json({
      success: false,
      message: "Failed to block domain",
      error: error.message
    });
  }
};

// Direct domain unblocking (without reminder ID) - for extension use
export const unblockDomainDirect = async (req, res) => {
  try {
    const { domain } = req.body;
    const userId = req.user.id;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "Domain is required"
      });
    }

    // Find all block-type reminders for this user
    const reminders = await Reminder.find({
      userId,
      type: "block",
      isBlocked: true
    });

    let found = false;
    for (const reminder of reminders) {
      const blockEntry = reminder.blockedDomains.find(block => {
        const normalizedDomain = domain.replace("www.", "").toLowerCase();
        const normalizedBlockDomain = block.domain
          .replace("www.", "")
          .toLowerCase();
        return (
          normalizedDomain.includes(normalizedBlockDomain) ||
          normalizedBlockDomain.includes(normalizedDomain)
        );
      });

      if (blockEntry) {
        await reminder.unblockDomain(domain);
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Domain not found in blocked list"
      });
    }

    res.status(200).json({
      success: true,
      message: "Domain unblocked successfully",
      data: { domain }
    });
  } catch (error) {
    console.error("Error unblocking domain directly:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unblock domain",
      error: error.message
    });
  }
};

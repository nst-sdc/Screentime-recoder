import Joi, { ref } from 'joi';
import mongoose from 'mongoose';
import User from './user.model';

const { string, required } = Joi;

const userActivitySchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  deviceInfo: {
    browser: {
      type: String,
      enum: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Other'],
      required: true
    },
    browserVersion: String,
    os: {
      type: String,
      enum: ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Other'],
      required: true
    },
    osVersion: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'other'],
      required: true
    },
    screenResolution: String,
    isMobile: Boolean,
    isTablet: Boolean,
    isDesktop: Boolean
  },
  locationInfo: {
    ipAddress: String,
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  pageViews: [{
    url: {
      type: String,
      required: true
    },
    path: String,
    queryParams: mongoose.Schema.Types.Mixed,
    title: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    timeOnPage: Number,
    referrer: String,
    scrollDepth: Number,
    engagement: {
      clicks: Number,
      keyPresses: Number,
      mouseMovements: Number
    }
  }],
  events: [{
    type: {
      type: String,
      enum: ['click', 'submit', 'download', 'scroll', 'hover', 'other'],
      required: true
    },
    element: String,
    value: String,
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionStart: {
    type: Date,
    required: true
  },
  sessionEnd: {
    type: Date,
    required: true
  },
  sessionDuration: Number
}, {
  timestamps: true
});
userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ sessionId: 1 });

export const UserActivity = mongoose.model('UserActivity', userActivitySchema);

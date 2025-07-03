import Tracking from '../models/tracking.model.js';

export const saveTrackingData = async (req, res) => {
  try {
    const { userId, eventType, eventData } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'eventType is required'
      });
    }

    const trackingEntry = new Tracking({
      userId,
      eventType,
      eventData
    });

    await trackingEntry.save();

    res.status(201).json({
      success: true,
      message: 'Tracking data saved successfully',
      data: trackingEntry
    });
  } catch (error) {
    console.error('Error saving tracking data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

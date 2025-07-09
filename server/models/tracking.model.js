import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  eventType: { type: String, required: true },
  eventData: { type: mongoose.Schema.Types.Mixed, required: false },
  timestamp: { type: Date, default: Date.now }
});

const Tracking = mongoose.model('Tracking', trackingSchema);

export default Tracking;

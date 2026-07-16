import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  userAgent: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.PushSubscription || mongoose.model("PushSubscription", pushSubscriptionSchema);

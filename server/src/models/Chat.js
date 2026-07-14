import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["customer", "ai", "admin", "system"], required: true },
  text: { type: String, required: true, maxlength: 2000 },
  mediaUrl: String,
  mediaType: { type: String, enum: ["image"] },
  orderNumber: String,
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  customerAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
  customerName: { type: String, default: "Guest", trim: true },
  customerPhone: { type: String, trim: true },
  status: { type: String, enum: ["ai", "pending", "accepted", "active", "closed"], default: "ai", index: true },
  messages: [messageSchema],
  acceptedAt: Date,
  closedAt: Date,
}, { timestamps: true });

chatSchema.index({ customerAccount: 1, updatedAt: -1 });

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);

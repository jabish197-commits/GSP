import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true },
  customerAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
  },
  items: [{
    fish: { type: mongoose.Schema.Types.ObjectId, ref: "Fish", required: true },
    name: String,
    price: Number,
    selectionType: { type: String, enum: ["pair", "trio", "set", "custom"], default: "pair" },
    fishPerPack: { type: Number, min: 1, default: 2 },
    quantity: { type: Number, min: 1, default: 1 },
    totalFish: { type: Number, min: 1 },
  }],
  total: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ["pending", "submitted", "verified", "rejected"], default: "pending", index: true },
  paymentProof: { url: String, publicId: String, submittedAt: Date },
  notes: { type: String, maxlength: 1000 },
  status: { type: String, enum: ["new", "confirmed", "preparing", "shipped", "completed", "cancelled"], default: "new", index: true },
}, { timestamps: true });

orderSchema.pre("validate", function setNumber() {
  if (!this.orderNumber) this.orderNumber = `SJG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
});

export default mongoose.model("Order", orderSchema);

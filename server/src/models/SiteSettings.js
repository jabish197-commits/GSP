import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "main" },
  businessName: { type: String, default: "SJ Guppy Paradise" },
  heroTitle: { type: String, default: "Colour that comes alive" },
  heroSubtitle: { type: String, default: "Healthy, home-bred premium guppies raised with care." },
  phone: String,
  whatsapp: String,
  email: String,
  instagramUrl: {
    type: String,
    trim: true,
    validate: {
      validator: (value) => !value || /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?(?:\?.*)?$/i.test(value),
      message: "Enter a valid Instagram profile URL.",
    },
  },
  location: String,
  deliveryNote: { type: String, default: "Live-fish delivery availability is confirmed before payment." },
  paymentQr: {
    url: String,
    publicId: String,
  },
  paymentName: { type: String, default: "SJ Guppy Paradise" },
  paymentInstructions: { type: String, default: "Scan with GPay or PhonePe. After payment, upload the screenshot for confirmation." },
  careTips: [{ title: String, text: String }],
}, { timestamps: true });

export default mongoose.model("SiteSettings", settingsSchema);

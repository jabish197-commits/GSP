import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, default: "", trim: true, maxlength: 30 },
  avatar: {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  password: { type: String, minlength: 8, select: false },
  googleId: { type: String, unique: true, sparse: true, index: true, select: false },
  facebookId: { type: String, unique: true, sparse: true, index: true, select: false },
  role: { type: String, enum: ["customer"], default: "customer" },
  active: { type: Boolean, default: true },
  lastLoginAt: Date,
}, { timestamps: true });

customerSchema.pre("save", async function hashPassword() {
  if (this.isModified("password") && this.password) this.password = await bcrypt.hash(this.password, 12);
});

customerSchema.methods.matchesPassword = function matchesPassword(value) {
  if (!this.password) return false;
  return bcrypt.compare(value, this.password);
};

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["admin"], default: "admin" },
  lastLoginAt: Date,
}, { timestamps: true });

export async function hashPassword() {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
}

adminSchema.pre("save", hashPassword);

adminSchema.methods.matchesPassword = function matchesPassword(value) {
  return bcrypt.compare(value, this.password);
};

export default mongoose.model("Admin", adminSchema);

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDatabase from "../config/database.js";
import Admin from "../models/Admin.js";

dotenv.config({ quiet: true });

const email = String(process.env.ADMIN_EMAIL || "").toLowerCase().trim();
const password = process.env.ADMIN_INITIAL_PASSWORD;

if (!email || !password) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD in server/.env first.");
}

try {
  await connectDatabase();
  const admin = await Admin.findOne({ email });

  if (!admin) {
    throw new Error(`Admin account not found for ${email}. Run create-admin first.`);
  }

  admin.password = password;
  await admin.save();
  console.log(`Admin password reset successfully for ${email}.`);
} finally {
  await mongoose.disconnect();
}

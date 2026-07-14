import dotenv from "dotenv";
import connectDatabase from "../config/database.js";
import Admin from "../models/Admin.js";

dotenv.config();
await connectDatabase();
const email = String(process.env.ADMIN_EMAIL || "").toLowerCase().trim();
if (!email || !process.env.ADMIN_INITIAL_PASSWORD) throw new Error("Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD first.");
const admin = await Admin.findOne({ email });
if (admin) console.log("Admin already exists.");
else {
  await Admin.create({ name: process.env.ADMIN_NAME || "SJ Guppy Paradise", email, password: process.env.ADMIN_INITIAL_PASSWORD });
  console.log("Initial admin created. Remove ADMIN_INITIAL_PASSWORD from .env now.");
}
process.exit(0);


import { Router } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", asyncHandler(async (request, response) => {
  const email = String(request.body.email || "").toLowerCase().trim();
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin || !(await admin.matchesPassword(String(request.body.password || "")))) {
    return response.status(401).json({ message: "Incorrect email or password." });
  }
  admin.lastLoginAt = new Date();
  await admin.save();
  const token = jwt.sign({ sub: admin.id, role: "admin" }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "8h" });
  response.cookie("sj_admin_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 60 * 60 * 1000 });
  response.json({ admin: { id: admin.id, name: admin.name, email: admin.email } });
}));

router.get("/me", requireAdmin, (request, response) => response.json({ admin: request.admin }));
router.post("/logout", (_request, response) => response.clearCookie("sj_admin_token").json({ message: "Logged out." }));

export default router;


import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";

export const requireAdmin = asyncHandler(async (request, response, next) => {
  const headerToken = request.headers.authorization?.startsWith("Bearer ") ? request.headers.authorization.slice(7) : null;
  const token = request.cookies?.sj_admin_token || headerToken;
  if (!token) return response.status(401).json({ message: "Admin login required." });
  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const admin = await Admin.findById(payload.sub);
  if (!admin) return response.status(401).json({ message: "Admin account not found." });
  request.admin = admin;
  next();
});


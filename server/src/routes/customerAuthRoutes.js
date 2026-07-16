import { Router } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import Customer from "../models/Customer.js";
import { requireCustomer } from "../middleware/customerAuth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { clearSessionCookieOptions, sessionCookieOptions } from "../utils/cookieOptions.js";
import { deleteMedia, uploadBuffer } from "../services/mediaService.js";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_IMAGE_SIZE_MB || 5) * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, file.mimetype.startsWith("image/")),
});

function publicCustomer(customer) {
  return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, avatar: customer.avatar || { url: "", publicId: "" } };
}

function setSession(response, customer) {
  const token = jwt.sign(
    { sub: customer.id, role: "customer" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "7d" },
  );
  response.cookie("sj_customer_token", token, sessionCookieOptions(7 * 24 * 60 * 60 * 1000));
}

router.post("/register", asyncHandler(async (request, response) => {
  const name = String(request.body.name || "").trim();
  const email = String(request.body.email || "").toLowerCase().trim();
  const phone = String(request.body.phone || "").trim();
  const password = String(request.body.password || "");
  if (name.length < 2) return response.status(400).json({ message: "Enter your full name." });
  if (!emailPattern.test(email)) return response.status(400).json({ message: "Enter a valid email address." });
  if (phone.length < 7) return response.status(400).json({ message: "Enter a valid phone or WhatsApp number." });
  if (password.length < 8) return response.status(400).json({ message: "Password must contain at least 8 characters." });
  if (await Customer.exists({ email })) return response.status(409).json({ message: "An account already exists for this email." });
  const customer = await Customer.create({ name, email, phone, password });
  setSession(response, customer);
  response.status(201).json({ customer: publicCustomer(customer) });
}));

router.post("/login", asyncHandler(async (request, response) => {
  const email = String(request.body.email || "").toLowerCase().trim();
  const customer = await Customer.findOne({ email, active: true }).select("+password");
  if (!customer || !(await customer.matchesPassword(String(request.body.password || "")))) {
    return response.status(401).json({ message: "Incorrect email or password." });
  }
  customer.lastLoginAt = new Date();
  await customer.save();
  setSession(response, customer);
  response.json({ customer: publicCustomer(customer) });
}));

router.get("/me", requireCustomer, (request, response) => {
  response.json({ customer: publicCustomer(request.customer) });
});

router.patch("/profile", requireCustomer, avatarUpload.single("avatar"), asyncHandler(async (request, response) => {
  const name = String(request.body.name || "").trim();
  const phone = String(request.body.phone || "").trim();
  if (name.length < 2) return response.status(400).json({ message: "Enter your full name." });
  if (phone.length < 7) return response.status(400).json({ message: "Enter a valid phone or WhatsApp number." });

  const customer = request.customer;
  customer.name = name;
  customer.phone = phone;

  if (request.file) {
    const previousAvatar = customer.avatar?.publicId ? { ...customer.avatar, type: "image" } : null;
    const uploaded = await uploadBuffer(request.file);
    customer.avatar = { url: uploaded.url, publicId: uploaded.publicId };
    await customer.save();
    if (previousAvatar) await deleteMedia(previousAvatar).catch(() => {});
  } else {
    await customer.save();
  }

  response.json({ customer: publicCustomer(customer), message: "Profile updated successfully." });
}));

router.post("/logout", (_request, response) => {
  response.clearCookie("sj_customer_token", clearSessionCookieOptions()).json({ message: "Logged out." });
});

export default router;

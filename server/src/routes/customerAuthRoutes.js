import { Router } from "express";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import { requireCustomer } from "../middleware/customerAuth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicCustomer(customer) {
  return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone };
}

function setSession(response, customer) {
  const token = jwt.sign(
    { sub: customer.id, role: "customer" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "7d" },
  );
  response.cookie("sj_customer_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
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

router.post("/logout", (_request, response) => {
  response.clearCookie("sj_customer_token").json({ message: "Logged out." });
});

export default router;

import { Router } from "express";
import Fish from "../models/Fish.js";
import Order from "../models/Order.js";
import Chat from "../models/Chat.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import { requireCustomer } from "../middleware/customerAuth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendAdminPush } from "../services/pushNotificationService.js";

const router = Router();

router.post("/", requireCustomer, asyncHandler(async (request, response) => {
  const requested = Array.isArray(request.body.items) ? request.body.items : [];
  if (!requested.length) return response.status(400).json({ message: "Select at least one guppy." });
  const ids = requested.map((item) => item.fish);
  const fish = await Fish.find({ _id: { $in: ids }, status: "available" });
  const items = requested.map((item) => {
    const found = fish.find((entry) => entry.id === item.fish);
    if (!found) throw Object.assign(new Error("One selected guppy is unavailable."), { status: 400 });
    const selectionType = ["pair", "trio", "set", "custom"].includes(item.selectionType) ? item.selectionType : "pair";
    const fixedCounts = { pair: 2, trio: 3, set: 4 };
    const fishPerPack = selectionType === "custom" ? Math.max(1, Math.min(Number(item.fishPerPack || 1), 50)) : fixedCounts[selectionType];
    const quantity = Math.max(1, Math.min(Number(item.quantity || 1), found.quantity));
    const listingBaseCount = found.sex === "pair" ? 2 : 1;
    const price = Math.round(found.price * fishPerPack / listingBaseCount);
    return { fish: found._id, name: found.name, price, selectionType, fishPerPack, quantity, totalFish: fishPerPack * quantity };
  });
  const customer = { ...request.body.customer, name: request.customer.name, email: request.customer.email, phone: request.customer.phone };
  const order = await Order.create({ customerAccount: request.customer._id, customer, notes: request.body.notes, items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) });
  sendAdminPush({
    title: "New guppy enquiry",
    body: `${customer.name} sent ${order.orderNumber} for ₹${order.total}.`,
    tag: `order-${order.id}`,
    url: "/",
  }).catch(() => {});
  response.status(201).json({ order: { orderNumber: order.orderNumber, total: order.total, status: order.status } });
}));

router.post("/:orderNumber/payment-proof", requireCustomer, asyncHandler(async (request, response) => {
  const order = await Order.findOne({ orderNumber: request.params.orderNumber, customerAccount: request.customer._id });
  if (!order) return response.status(404).json({ message: "Order not found." });
  const media = request.body.media || {};
  if (!String(media.url || "").startsWith("https://res.cloudinary.com/") || !media.publicId) {
    return response.status(400).json({ message: "Upload a valid payment screenshot first." });
  }
  const chat = await Chat.findOne({ sessionId: request.body.chatSessionId, customerAccount: request.customer._id });
  if (!chat) return response.status(404).json({ message: "Private customer chat not found." });
  order.paymentStatus = "submitted";
  order.paymentProof = { url: media.url, publicId: media.publicId, submittedAt: new Date() };
  await order.save();
  chat.messages.push({ sender: "customer", text: `Payment screenshot for ${order.orderNumber}`, mediaUrl: media.url, mediaType: "image", orderNumber: order.orderNumber });
  chat.status = "pending";
  await chat.save();
  sendAdminPush({
    title: "Payment screenshot received",
    body: `${request.customer.name} submitted payment proof for ${order.orderNumber}.`,
    tag: `payment-${order.id}`,
    url: "/",
  }).catch(() => {});
  response.json({ order, chat });
}));

router.get("/mine", requireCustomer, asyncHandler(async (request, response) => {
  const orders = await Order.find({ customerAccount: request.customer._id }).sort({ createdAt: -1 });
  response.json({ orders });
}));

router.get("/", requireAdmin, asyncHandler(async (_request, response) => response.json({ orders: await Order.find().sort({ createdAt: -1 }) })));
router.patch("/:id/status", requireAdmin, asyncHandler(async (request, response) => {
  const status = request.body.status;
  const update = { status };
  if (status === "confirmed") update.acceptedAt = new Date();
  const order = await Order.findByIdAndUpdate(request.params.id, update, { returnDocument: "after", runValidators: true });
  if (!order) return response.status(404).json({ message: "Order not found." });
  response.json({ order });
}));
router.patch("/:id/payment-status", requireAdmin, asyncHandler(async (request, response) => {
  const allowed = ["pending", "submitted", "verified", "rejected"];
  if (!allowed.includes(request.body.paymentStatus)) return response.status(400).json({ message: "Invalid payment status." });
  const paymentStatus = request.body.paymentStatus;
  const update = { paymentStatus, "paymentTracking.adminNote": String(request.body.adminNote || "").trim().slice(0, 500) };
  if (paymentStatus === "verified") update["paymentTracking.verifiedAt"] = new Date();
  if (paymentStatus === "rejected") update["paymentTracking.rejectedAt"] = new Date();
  const order = await Order.findByIdAndUpdate(request.params.id, update, { returnDocument: "after", runValidators: true });
  if (!order) return response.status(404).json({ message: "Order not found." });
  response.json({ order });
}));

export default router;

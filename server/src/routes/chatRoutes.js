import { Router } from "express";
import { randomUUID } from "node:crypto";
import Chat from "../models/Chat.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import { requireCustomer } from "../middleware/customerAuth.js";
import answerCustomer from "../services/aiChatService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendAdminPush } from "../services/pushNotificationService.js";

const router = Router();

router.post("/session", requireCustomer, asyncHandler(async (request, response) => {
  const savedSessionId = String(request.body.sessionId || "");
  let chat = savedSessionId
    ? await Chat.findOne({ sessionId: savedSessionId, customerAccount: request.customer._id })
    : null;
  if (!chat) {
    chat = await Chat.findOne({
      customerAccount: request.customer._id,
      status: { $ne: "closed" },
    }).sort({ updatedAt: -1 });
  }
  if (!chat) {
    chat = await Chat.create({
      sessionId: randomUUID(),
      customerAccount: request.customer._id,
      customerName: request.customer.name,
      customerPhone: request.customer.phone,
      messages: [{ sender: "system", text: "Welcome to SJ Guppy Paradise. Ask about guppies, care, prices, or delivery." }],
    });
  } else if (chat.customerName !== request.customer.name || chat.customerPhone !== request.customer.phone) {
    chat.customerName = request.customer.name;
    chat.customerPhone = request.customer.phone;
    await chat.save();
  }
  response.status(201).json({ chat });
}));

router.get("/session/:sessionId", requireCustomer, asyncHandler(async (request, response) => {
  const chat = await Chat.findOne({ sessionId: request.params.sessionId, customerAccount: request.customer._id });
  if (!chat) return response.status(404).json({ message: "Chat not found." });
  response.json({ chat });
}));

router.post("/session/:sessionId/message", requireCustomer, asyncHandler(async (request, response) => {
  const text = String(request.body.text || "").trim();
  if (!text) return response.status(400).json({ message: "Message cannot be empty." });
  const chat = await Chat.findOne({ sessionId: request.params.sessionId, customerAccount: request.customer._id });
  if (!chat) return response.status(404).json({ message: "Chat not found." });
  chat.messages.push({ sender: "customer", text });
  if (chat.status === "ai") chat.messages.push({ sender: "ai", text: await answerCustomer(text) });
  await chat.save();
  sendAdminPush({
    title: `Message from ${request.customer.name}`,
    body: text.length > 100 ? `${text.slice(0, 97)}…` : text,
    tag: `chat-${chat.id}`,
    url: "/",
  }).catch(() => {});
  response.json({ chat });
}));

router.patch("/session/:sessionId/message/:messageId", requireCustomer, asyncHandler(async (request, response) => {
  const text = String(request.body.text || "").trim();
  if (!text) return response.status(400).json({ message: "Message cannot be empty." });
  const chat = await Chat.findOne({ sessionId: request.params.sessionId, customerAccount: request.customer._id });
  if (!chat) return response.status(404).json({ message: "Chat not found." });
  const message = chat.messages.id(request.params.messageId);
  if (!message) return response.status(404).json({ message: "Message not found." });
  if (message.sender !== "customer") return response.status(403).json({ message: "You can edit only your own messages." });
  message.text = text;
  await chat.save();
  response.json({ chat });
}));

router.delete("/session/:sessionId/message/:messageId", requireCustomer, asyncHandler(async (request, response) => {
  const chat = await Chat.findOne({ sessionId: request.params.sessionId, customerAccount: request.customer._id });
  if (!chat) return response.status(404).json({ message: "Chat not found." });
  const message = chat.messages.id(request.params.messageId);
  if (!message) return response.status(404).json({ message: "Message not found." });
  if (message.sender !== "customer") return response.status(403).json({ message: "You can delete only your own messages." });
  message.deleteOne();
  await chat.save();
  response.json({ chat });
}));

router.post("/session/:sessionId/request-admin", requireCustomer, asyncHandler(async (request, response) => {
  const chat = await Chat.findOne({ sessionId: request.params.sessionId, customerAccount: request.customer._id });
  if (!chat) return response.status(404).json({ message: "Chat not found." });
  chat.customerName = request.customer.name;
  chat.customerPhone = request.customer.phone;
  chat.status = "pending";
  chat.messages.push({ sender: "system", text: "Your request was sent to the breeder." });
  await chat.save();
  sendAdminPush({
    title: "New breeder request",
    body: `${request.customer.name} requested to chat with you.`,
    tag: `chat-request-${chat.id}`,
    url: "/",
  }).catch(() => {});
  response.json({ chat });
}));

router.get("/admin", requireAdmin, asyncHandler(async (_request, response) => response.json({ chats: await Chat.find().sort({ updatedAt: -1 }).limit(100) })));
router.patch("/admin/:id/status", requireAdmin, asyncHandler(async (request, response) => {
  const update = { status: request.body.status };
  if (request.body.status === "accepted") update.acceptedAt = new Date();
  if (request.body.status === "closed") update.closedAt = new Date();
  const chat = await Chat.findByIdAndUpdate(request.params.id, update, { returnDocument: "after", runValidators: true });
  response.json({ chat });
}));
router.post("/admin/:id/message", requireAdmin, asyncHandler(async (request, response) => {
  const text = String(request.body.text || "").trim();
  if (!text) return response.status(400).json({ message: "Message cannot be empty." });
  const chat = await Chat.findById(request.params.id);
  if (!chat) return response.status(404).json({ message: "Chat not found." });
  chat.status = "active";
  chat.messages.push({ sender: "admin", text });
  await chat.save();
  response.json({ chat });
}));

router.patch("/admin/:id/message/:messageId", requireAdmin, asyncHandler(async (request, response) => {
  const text = String(request.body.text || "").trim();
  if (!text) return response.status(400).json({ message: "Message cannot be empty." });
  const chat = await Chat.findById(request.params.id);
  if (!chat) return response.status(404).json({ message: "Chat not found." });
  const message = chat.messages.id(request.params.messageId);
  if (!message) return response.status(404).json({ message: "Message not found." });
  if (message.sender !== "admin") return response.status(403).json({ message: "Admin can edit only admin replies." });
  message.text = text;
  await chat.save();
  response.json({ chat });
}));

router.delete("/admin/:id/message/:messageId", requireAdmin, asyncHandler(async (request, response) => {
  const chat = await Chat.findById(request.params.id);
  if (!chat) return response.status(404).json({ message: "Chat not found." });
  const message = chat.messages.id(request.params.messageId);
  if (!message) return response.status(404).json({ message: "Message not found." });
  if (message.sender !== "admin") return response.status(403).json({ message: "Admin can delete only admin replies." });
  message.deleteOne();
  await chat.save();
  response.json({ chat });
}));

export default router;

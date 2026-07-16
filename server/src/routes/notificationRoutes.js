import { Router } from "express";
import PushSubscription from "../models/PushSubscription.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendAdminPush, vapidPublicKey } from "../services/pushNotificationService.js";

const router = Router();

router.get("/public-key", requireAdmin, (_request, response) => {
  const publicKey = vapidPublicKey();
  if (!publicKey) return response.status(503).json({ message: "Push notifications are not configured." });
  response.json({ publicKey });
});

router.post("/subscribe", requireAdmin, asyncHandler(async (request, response) => {
  const subscription = request.body.subscription;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return response.status(400).json({ message: "Invalid notification subscription." });
  }
  await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    { endpoint: subscription.endpoint, keys: subscription.keys, userAgent: request.headers["user-agent"], active: true },
    { upsert: true, returnDocument: "after", runValidators: true },
  );
  response.status(201).json({ message: "Mobile notifications enabled." });
}));

router.post("/test", requireAdmin, asyncHandler(async (_request, response) => {
  await sendAdminPush({ title: "SJ Guppy Paradise", body: "Mobile notifications are working.", tag: "notification-test", url: "/" });
  response.json({ message: "Test notification sent." });
}));

export default router;

import webpush from "web-push";
import PushSubscription from "../models/PushSubscription.js";

function configured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function configure() {
  if (!configured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
  return true;
}

export async function sendAdminPush({ title, body, tag, url = "/" }) {
  if (!configure()) return;
  const subscriptions = await PushSubscription.find({ active: true });
  const payload = JSON.stringify({ title, body, tag, url, icon: "/logo.png" });
  await Promise.allSettled(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: subscription.keys }, payload);
    } catch (error) {
      if ([404, 410].includes(error.statusCode)) {
        subscription.active = false;
        await subscription.save();
      }
    }
  }));
}

export function vapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || "";
}

import { Router } from "express";
import SiteSettings from "../models/SiteSettings.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(async (_request, response) => response.json({ settings: await SiteSettings.findOneAndUpdate({ key: "main" }, { $setOnInsert: { key: "main" } }, { upsert: true, returnDocument: "after" }) })));
router.put("/", requireAdmin, asyncHandler(async (request, response) => {
  const update = { ...request.body };
  const instagram = String(update.instagramUrl || "").trim();
  update.instagramUrl = instagram && !/^https?:\/\//i.test(instagram)
    ? `https://www.instagram.com/${instagram.replace(/^@/, "").replace(/\/$/, "")}/`
    : instagram;
  response.json({ settings: await SiteSettings.findOneAndUpdate({ key: "main" }, update, { upsert: true, returnDocument: "after", runValidators: true }) });
}));
export default router;

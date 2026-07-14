import { Router } from "express";
import Fish from "../models/Fish.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteMedia } from "../services/mediaService.js";

const router = Router();

router.get("/", asyncHandler(async (request, response) => {
  const filter = {};
  if (request.query.status) filter.status = request.query.status;
  if (request.query.featured === "true") filter.featured = true;
  if (request.query.search) filter.$or = ["name", "strain"].map((key) => ({ [key]: { $regex: request.query.search, $options: "i" } }));
  response.json({ fish: await Fish.find(filter).sort({ featured: -1, createdAt: -1 }) });
}));

router.get("/:idOrSlug", asyncHandler(async (request, response) => {
  const value = request.params.idOrSlug;
  const fish = await Fish.findOne(value.match(/^[a-f\d]{24}$/i) ? { _id: value } : { slug: value });
  if (!fish) return response.status(404).json({ message: "Fish not found." });
  response.json({ fish });
}));

router.post("/", requireAdmin, asyncHandler(async (request, response) => response.status(201).json({ fish: await Fish.create(request.body) })));
router.put("/:id", requireAdmin, asyncHandler(async (request, response) => {
  const existing = await Fish.findById(request.params.id);
  if (!existing) return response.status(404).json({ message: "Fish not found." });
  const retainedMedia = new Set((request.body.media || []).map((item) => item.publicId || item.url));
  const removedMedia = existing.media.filter((item) => !retainedMedia.has(item.publicId || item.url));
  const fish = await Fish.findByIdAndUpdate(request.params.id, request.body, { returnDocument: "after", runValidators: true });
  await Promise.allSettled(removedMedia.map((item) => deleteMedia(item)));
  response.json({ fish });
}));
router.delete("/:id", requireAdmin, asyncHandler(async (request, response) => {
  const fish = await Fish.findByIdAndDelete(request.params.id);
  if (!fish) return response.status(404).json({ message: "Fish not found." });
  await Promise.allSettled(fish.media.map((item) => deleteMedia(item)));
  response.json({ message: "Fish deleted." });
}));

export default router;

import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { requireAdmin } from "../middleware/adminAuth.js";
import { requireCustomer } from "../middleware/customerAuth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: Number(process.env.MAX_VIDEO_SIZE_MB || 100) * 1024 * 1024 }, fileFilter: (_request, file, callback) => callback(null, file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) });
const proofUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: Number(process.env.MAX_IMAGE_SIZE_MB || 5) * 1024 * 1024 }, fileFilter: (_request, file, callback) => callback(null, file.mimetype.startsWith("image/")) });

router.post("/payment-proof", requireCustomer, proofUpload.single("file"), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ message: "Select a payment screenshot image." });
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: `${process.env.CLOUDINARY_FOLDER || "sj_guppy_paradise"}/payment-proofs`, resource_type: "image" }, (error, value) => error ? reject(error) : resolve(value));
      stream.end(request.file.buffer);
    });
    response.status(201).json({ media: { url: result.secure_url, publicId: result.public_id, type: "image" } });
  } catch (error) { next(error); }
});

router.post("/", requireAdmin, upload.single("file"), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ message: "Select an image or video." });
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
    const type = request.file.mimetype.startsWith("video/") ? "video" : "image";
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: process.env.CLOUDINARY_FOLDER || "sj_guppy_paradise", resource_type: type }, (error, value) => error ? reject(error) : resolve(value));
      stream.end(request.file.buffer);
    });
    response.status(201).json({ media: { url: result.secure_url, publicId: result.public_id, type } });
  } catch (error) { next(error); }
});

export default router;

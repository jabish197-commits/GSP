import cloudinary from "../config/cloudinary.js";

export function uploadBuffer(file) {
  const type = file.mimetype.startsWith("video/") ? "video" : "image";
  return new Promise((resolve,reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: process.env.CLOUDINARY_FOLDER || "sj_guppy_paradise",
      resource_type: type,
    }, (error,result) => error ? reject(error) : resolve({ url:result.secure_url, publicId:result.public_id, type }));
    stream.end(file.buffer);
  });
}

export async function deleteMedia(media) {
  if (!media?.publicId) return;
  await cloudinary.uploader.destroy(media.publicId, {
    resource_type: media.type === "video" ? "video" : "image",
    invalidate: true,
  });
}

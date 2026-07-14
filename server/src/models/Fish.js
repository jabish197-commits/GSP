import mongoose from "mongoose";
import slugify from "slugify";

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: String,
  type: { type: String, enum: ["image", "video"], default: "image" },
  alt: String,
}, { _id: false });

const fishSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  strain: { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 3000 },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, default: 1, min: 0 },
  sex: { type: String, enum: ["male", "female", "pair", "juvenile", "mixed"], default: "pair" },
  age: { type: String, trim: true },
  status: { type: String, enum: ["available", "reserved", "sold"], default: "available", index: true },
  featured: { type: Boolean, default: false },
  media: [mediaSchema],
}, { timestamps: true });

fishSchema.pre("validate", async function makeSlug() {
  if (!this.isModified("name") && this.slug) return;
  const base = slugify(this.name || "guppy", { lower: true, strict: true });
  let candidate = base;
  let number = 1;
  while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) candidate = `${base}-${number++}`;
  this.slug = candidate;
});

export default mongoose.model("Fish", fishSchema);

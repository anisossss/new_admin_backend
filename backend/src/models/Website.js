import mongoose from "mongoose";
import slugify from "slugify";

const websiteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    url: String,
    description: String,
    language: { type: String, enum: ["fr", "en", "ar"], default: "fr" },
    themeColor: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate the slug from the name when missing, then de-duplicate
// by appending -2, -3, … until the slug is unique.
websiteSchema.pre("validate", async function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (this.slug && this.isModified("slug")) {
    const base = this.slug;
    let candidate = base;
    let n = 2;
    while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${base}-${n++}`;
    }
    this.slug = candidate;
  }
});

export default mongoose.model("Website", websiteSchema);

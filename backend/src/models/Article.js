import mongoose from "mongoose";
import slugify from "slugify";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: String,
    content: String, // HTML from Tiptap
    coverImage: {
      url: String,
      alt: String,
    },
    category: { type: String, default: "Actualités" },
    tags: [String],
    author: {
      name: { type: String, default: "Rédaction" },
    },
    websites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Website" }],
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    publishedAt: Date,
    scheduledFor: Date,
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      ogImage: String,
      canonicalUrl: String,
      noIndex: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Auto-generate the slug from the title when missing, then de-duplicate
// by appending -2, -3, … until the slug is unique.
articleSchema.pre("validate", async function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
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

export default mongoose.model("Article", articleSchema);

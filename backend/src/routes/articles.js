import { Router } from "express";
import Article from "../models/Article.js";

const router = Router();

const WEBSITE_FIELDS = "name slug themeColor";

const EDITABLE_FIELDS = [
  "title",
  "slug",
  "excerpt",
  "content",
  "coverImage",
  "category",
  "tags",
  "author",
  "websites",
  "status",
  "publishedAt",
  "scheduledFor",
  "featured",
  "seo",
];

function pickFields(body = {}) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  return data;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/articles?status=&website=&category=&search=&page=1&limit=20
router.get("/", async (req, res, next) => {
  try {
    const { status, website, category, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const query = {};
    if (status) query.status = status;
    if (website) query.websites = website;
    if (category) query.category = category;
    if (search) query.title = { $regex: escapeRegex(search), $options: "i" };

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort("-updatedAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("websites", WEBSITE_FIELDS),
      Article.countDocuments(query),
    ]);

    res.json({ articles, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:id
router.get("/:id", async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id).populate("websites", WEBSITE_FIELDS);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (err) {
    next(err);
  }
});

// POST /api/articles
router.post("/", async (req, res, next) => {
  try {
    const data = pickFields(req.body);
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const article = new Article(data);
    await article.save();
    await article.populate("websites", WEBSITE_FIELDS);
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
});

// PUT /api/articles/:id
router.put("/:id", async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    const data = pickFields(req.body);
    if ("slug" in data && !data.slug) data.slug = undefined; // empty slug → regenerate from title
    article.set(data);

    // On transition to published without an explicit date, stamp it now.
    if (article.status === "published" && !article.publishedAt) {
      article.publishedAt = new Date();
    }

    await article.save();
    await article.populate("websites", WEBSITE_FIELDS);
    res.json(article);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/articles/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/:id/duplicate — fresh draft copy
router.post("/:id/duplicate", async (req, res, next) => {
  try {
    const original = await Article.findById(req.params.id);
    if (!original) return res.status(404).json({ error: "Article not found" });

    const data = original.toObject();
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.slug; // regenerated from the new title by the pre-validate hook
    delete data.publishedAt;
    delete data.scheduledFor;

    const copy = new Article({
      ...data,
      title: `${original.title} (copie)`,
      status: "draft",
      views: 0,
    });
    await copy.save();
    await copy.populate("websites", WEBSITE_FIELDS);
    res.status(201).json(copy);
  } catch (err) {
    next(err);
  }
});

export default router;

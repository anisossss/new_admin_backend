import { Router } from "express";
import Website from "../models/Website.js";
import Article from "../models/Article.js";

const router = Router();

async function findSite(req, res) {
  const site = await Website.findOne({ slug: req.params.siteSlug });
  if (!site) {
    res.status(404).json({ error: "Website not found" });
    return null;
  }
  return site;
}

// GET /api/public/:siteSlug/articles?page=1&limit=12&category=&featured=true&exclude=<slug>
router.get("/:siteSlug/articles", async (req, res, next) => {
  try {
    const site = await findSite(req, res);
    if (!site) return;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const query = { status: "published", websites: site._id };
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === "true") query.featured = true;
    if (req.query.exclude) query.slug = { $ne: req.query.exclude };

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort("-publishedAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-content"),
      Article.countDocuments(query),
    ]);

    res.json({ articles, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/public/:siteSlug/articles/:articleSlug — full article, increments views
router.get("/:siteSlug/articles/:articleSlug", async (req, res, next) => {
  try {
    const site = await findSite(req, res);
    if (!site) return;

    const article = await Article.findOneAndUpdate(
      { slug: req.params.articleSlug, status: "published", websites: site._id },
      { $inc: { views: 1 } },
      { new: true, timestamps: false }
    );
    if (!article) {
      return res.status(404).json({ error: "Article not found on this website" });
    }
    res.json(article);
  } catch (err) {
    next(err);
  }
});

// GET /api/public/:siteSlug/categories — distinct categories of published articles
router.get("/:siteSlug/categories", async (req, res, next) => {
  try {
    const site = await findSite(req, res);
    if (!site) return;

    const categories = await Article.distinct("category", {
      status: "published",
      websites: site._id,
    });
    res.json(categories.filter(Boolean).sort((a, b) => a.localeCompare(b, "fr")));
  } catch (err) {
    next(err);
  }
});

export default router;

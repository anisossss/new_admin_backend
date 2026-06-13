import { Router } from "express";
import Website from "../models/Website.js";
import Article from "../models/Article.js";

const router = Router();

// GET /api/stats — dashboard numbers
router.get("/", async (req, res, next) => {
  try {
    const [articles, published, drafts, websitesCount, viewsAgg, sites, perSiteAgg, recent] =
      await Promise.all([
        Article.countDocuments(),
        Article.countDocuments({ status: "published" }),
        Article.countDocuments({ status: "draft" }),
        Website.countDocuments(),
        Article.aggregate([{ $group: { _id: null, views: { $sum: "$views" } } }]),
        Website.find().sort("name"),
        Article.aggregate([
          { $unwind: "$websites" },
          { $group: { _id: "$websites", articles: { $sum: 1 }, views: { $sum: "$views" } } },
        ]),
        Article.find()
          .sort("-updatedAt")
          .limit(8)
          .select("-content")
          .populate("websites", "name slug themeColor"),
      ]);

    const bySite = new Map(perSiteAgg.map((row) => [String(row._id), row]));
    const perWebsite = sites.map((site) => {
      const row = bySite.get(String(site._id));
      return {
        name: site.name,
        slug: site.slug,
        themeColor: site.themeColor,
        articles: row ? row.articles : 0,
        views: row ? row.views : 0,
      };
    });

    res.json({
      totals: {
        articles,
        published,
        drafts,
        websites: websitesCount,
        views: viewsAgg.length ? viewsAgg[0].views : 0,
      },
      perWebsite,
      recent,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from "express";
import Website from "../models/Website.js";
import Article from "../models/Article.js";

const router = Router();

const EDITABLE_FIELDS = ["name", "slug", "url", "description", "language", "themeColor", "active"];

function pickFields(body = {}) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  return data;
}

// GET /api/websites — all websites sorted by name
router.get("/", async (req, res, next) => {
  try {
    const websites = await Website.find().sort("name");
    res.json(websites);
  } catch (err) {
    next(err);
  }
});

// GET /api/websites/:id
router.get("/:id", async (req, res, next) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) return res.status(404).json({ error: "Website not found" });
    res.json(website);
  } catch (err) {
    next(err);
  }
});

// POST /api/websites
router.post("/", async (req, res, next) => {
  try {
    const website = new Website(pickFields(req.body));
    await website.save();
    res.status(201).json(website);
  } catch (err) {
    next(err);
  }
});

// PUT /api/websites/:id
router.put("/:id", async (req, res, next) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) return res.status(404).json({ error: "Website not found" });
    const data = pickFields(req.body);
    if ("slug" in data && !data.slug) data.slug = undefined; // empty slug → regenerate from name
    website.set(data);
    await website.save();
    res.json(website);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/websites/:id — also removes dangling references from articles
router.delete("/:id", async (req, res, next) => {
  try {
    const website = await Website.findByIdAndDelete(req.params.id);
    if (!website) return res.status(404).json({ error: "Website not found" });
    await Article.updateMany({ websites: website._id }, { $pull: { websites: website._id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

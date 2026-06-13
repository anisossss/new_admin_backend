import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import slugify from "slugify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext);
    const slug = slugify(base, { lower: true, strict: true }) || "image";
    cb(null, `${Date.now()}-${slug}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    const err = new Error("Only image files are allowed");
    err.status = 400;
    cb(err);
  },
});

function fileUrl(req, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}

const router = Router();

// POST /api/upload — multipart field name "file"
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded (expected multipart field "file")' });
  }
  res.status(201).json({ url: fileUrl(req, req.file.filename), filename: req.file.filename });
});

// GET /api/media — media library, newest first
router.get("/media", async (req, res, next) => {
  try {
    const entries = await fs.promises.readdir(UPLOADS_DIR);
    const files = [];
    for (const filename of entries) {
      if (filename === ".gitkeep") continue;
      const stat = await fs.promises.stat(path.join(UPLOADS_DIR, filename));
      if (!stat.isFile()) continue;
      files.push({
        filename,
        url: fileUrl(req, filename),
        size: stat.size,
        createdAt: stat.birthtime,
      });
    }
    files.sort((a, b) => b.createdAt - a.createdAt);
    res.json(files);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/media/:filename
router.delete("/media/:filename", async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (filename === ".gitkeep" || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    await fs.promises.unlink(filePath);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

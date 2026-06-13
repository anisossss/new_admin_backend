import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { connectDB, isMongoConnected, requireDb } from "./db.js";
import websiteRoutes from "./routes/websites.js";
import articleRoutes from "./routes/articles.js";
import publicRoutes from "./routes/public.js";
import aiRoutes from "./routes/ai.js";
import uploadRoutes from "./routes/upload.js";
import statsRoutes from "./routes/stats.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Health — always available, even when MongoDB is down
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mongo: isMongoConnected(),
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
});

// MongoDB-backed routes (fast 503 while the database is unreachable)
app.use("/api/websites", requireDb, websiteRoutes);
app.use("/api/articles", requireDb, articleRoutes);
app.use("/api/public", requireDb, publicRoutes);
app.use("/api/stats", requireDb, statsRoutes);

// Routes that work without MongoDB
app.use("/api/ai", aiRoutes);
app.use("/api", uploadRoutes); // POST /api/upload, GET /api/media, DELETE /api/media/:filename

// Unknown API route
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "CastError") {
    status = 400;
    message = `Invalid value for "${err.path}"`;
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  } else if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for "${Object.keys(err.keyPattern || {}).join(", ")}"`;
  } else if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File too large (max 8 MB)" : err.message;
  }

  if (status >= 500) console.error("[error]", err);
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`[server] Tunisia News API listening on http://localhost:${PORT}`);
  console.log(`[server] AI configured: ${Boolean(process.env.ANTHROPIC_API_KEY)}`);
});

connectDB();

import mongoose from "mongoose";

const RETRY_DELAY_MS = 5000;

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Express middleware for routes that need MongoDB. Returns a fast 503 instead
 * of letting mongoose buffer queries while the database is unreachable.
 */
export function requireDb(req, res, next) {
  if (!isMongoConnected()) {
    return res
      .status(503)
      .json({ error: "MongoDB is not connected. Start MongoDB and try again." });
  }
  next();
}

/**
 * Connect to MongoDB with infinite retry. The HTTP server keeps running while
 * the database is down — /api/health and the AI routes stay available.
 */
export function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tunisia_news";

  mongoose.connection.on("connected", () => {
    console.log(`[mongo] connected — ${uri}`);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[mongo] disconnected");
  });

  const attempt = async () => {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    } catch (err) {
      console.warn(`[mongo] connection failed: ${err.message}`);
      console.warn(
        `[mongo] retrying in ${RETRY_DELAY_MS / 1000}s — the API stays up (health & AI routes work without MongoDB)`
      );
      setTimeout(attempt, RETRY_DELAY_MS);
    }
  };

  attempt();
}

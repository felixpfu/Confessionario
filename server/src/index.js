import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { registerMessageRoutes } from "./routes.messages.js";
import { startCleanupJob } from "./cleanup.js";
import { checkMessageStore, useMemoryStore } from "./messages.store.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "64kb" }));

const corsOrigin = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: corsOrigin }));


const getLimiter = rateLimit({
  windowMs: 60 * 1000, 
  limit: 300,          
  standardHeaders: true,
  legacyHeaders: false
});
app.get("/messages", getLimiter);

// limite forte (anti-spam)
const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Calma aí: limite de posts atingido. Tenta de novo depois." }
});
app.post("/messages", postLimiter);

// Health check
app.get("/health", async (_, res) => {
  try {
    const store = await checkMessageStore();
    res.json(store);
  } catch {
    res.status(500).json({ ok: false, store: useMemoryStore ? "memory" : "postgres" });
  }
});

registerMessageRoutes(app);

startCleanupJob();

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "localhost";
app.listen(port, host, () => {
  console.log(`Server rodando em http://${host}:${port}`);
});

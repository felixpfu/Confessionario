import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { pool } from "./db.js";
import { registerMessageRoutes } from "./routes.messages.js";
import { startCleanupJob } from "./cleanup.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "64kb" }));

app.use(
  cors({
    origin: "*"
  })
);


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
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

registerMessageRoutes(app);

startCleanupJob();

const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () => {
  console.log(`Server rodando em http://10.10.29.132:${port}`);
});

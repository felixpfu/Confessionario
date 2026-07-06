import express from "express";
import fs from "fs";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import "dotenv/config";
import { registerMessageRoutes } from "./routes.messages.js";
import { startCleanupJob } from "./cleanup.js";
import { checkMessageStore, useMemoryStore } from "./messages.store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

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

// limite forte (anti-spam)
const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Calma aí: limite de posts atingido. Tenta de novo depois." }
});

const messageRouter = express.Router();
messageRouter.get("/messages", getLimiter);
messageRouter.post("/messages", postLimiter);
registerMessageRoutes(messageRouter);
app.use("/", messageRouter);
app.use("/api", messageRouter);

// Health check
app.get(["/health", "/api/health"], async (_, res) => {
  try {
    const store = await checkMessageStore();
    res.json(store);
  } catch {
    res.status(500).json({ ok: false, store: useMemoryStore ? "memory" : "postgres" });
  }
});
app.use("/api", (_, res) => {
  res.status(404).json({ error: "Rota da API não encontrada." });
});

if (fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (_, res) => {
    res.sendFile(clientIndexPath);
  });
} else {
  app.get("/", (_, res) => {
    res.status(503).send("Frontend build não encontrado. Rode `npm --prefix client run build`.");
  });
}

startCleanupJob();

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "localhost";
app.listen(port, host, () => {
  console.log(`Server rodando em http://${host}:${port}`);
});

import crypto from "crypto";
import { pool } from "./db.js";
import { sanitizeContent } from "./sanitize.js";

const ALLOWED_TTLS = new Set([600, 3600, 86400]); 
const MAX_LEN = 999;

function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || "default_salt";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function registerMessageRoutes(app) {
  app.get("/messages", async (req, res) => {
    try {
      const { rows } = await pool.query(
        `
        SELECT id, content, created_at AS "createdAt", expires_at AS "expiresAt"
        FROM messages
        WHERE expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 200
        `
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(999).json({ error: "Erro ao buscar mensagens." });
    }
  });

  app.post("/messages", async (req, res) => {
    try {
      const content = sanitizeContent(req.body?.content);
      const ttlSeconds = Number(req.body?.ttlSeconds);

      if (!content || content.length < 1) {
        return res.status(400).json({ error: "Mensagem vazia." });
      }
      if (content.length > MAX_LEN) {
        return res.status(400).json({ error: `Máximo de ${MAX_LEN} caracteres.` });
      }
      if (!ALLOWED_TTLS.has(ttlSeconds)) {
        return res.status(400).json({ error: "TTL inválido. Use 600, 3600 ou 86400." });
      }

      const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "").trim();
      const ipHash = ip ? hashIp(ip) : null;

      const { rows } = await pool.query(
        `
        INSERT INTO messages (content, expires_at, ip_hash)
        VALUES ($1, NOW() + ($2 || ' seconds')::interval, $3)
        RETURNING id, content, created_at AS "createdAt", expires_at AS "expiresAt"
        `,
        [content, String(ttlSeconds), ipHash]
      );

      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao criar mensagem." });
    }
  });
}

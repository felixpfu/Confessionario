import crypto from "crypto";
import { pool } from "./db.js";

const memoryMessages = [];

export const useMemoryStore =
  process.env.MESSAGE_STORE === "memory" || process.env.USE_MEMORY_STORE === "true";

export async function checkMessageStore() {
  if (useMemoryStore) {
    return { ok: true, store: "memory" };
  }

  await pool.query("SELECT 1");
  return { ok: true, store: "postgres" };
}

export async function listMessages() {
  if (useMemoryStore) {
    const now = Date.now();
    return memoryMessages
      .filter((message) => new Date(message.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 200)
      .map(toPublicMessage);
  }

  const { rows } = await pool.query(
    `
    SELECT id, content, created_at AS "createdAt", expires_at AS "expiresAt"
    FROM messages
    WHERE expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 200
    `
  );

  return rows;
}

export async function createMessage({ content, ttlSeconds, ipHash }) {
  if (useMemoryStore) {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000);
    const message = {
      id: crypto.randomUUID(),
      content,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      ipHash
    };

    memoryMessages.unshift(message);

    return toPublicMessage(message);
  }

  const { rows } = await pool.query(
    `
    INSERT INTO messages (content, expires_at, ip_hash)
    VALUES ($1, NOW() + ($2 || ' seconds')::interval, $3)
    RETURNING id, content, created_at AS "createdAt", expires_at AS "expiresAt"
    `,
    [content, String(ttlSeconds), ipHash]
  );

  return rows[0];
}

export async function cleanupExpiredMessages() {
  if (useMemoryStore) {
    const now = Date.now();
    for (let i = memoryMessages.length - 1; i >= 0; i -= 1) {
      if (new Date(memoryMessages[i].expiresAt).getTime() <= now) {
        memoryMessages.splice(i, 1);
      }
    }
    return;
  }

  await pool.query("DELETE FROM messages WHERE expires_at <= NOW()");
}

function toPublicMessage(message) {
  const { ipHash: _ipHash, ...publicMessage } = message;
  return publicMessage;
}

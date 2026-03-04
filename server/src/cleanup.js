import { pool } from "./db.js";

export function startCleanupJob() {
  setInterval(async () => {
    try {
      await pool.query("DELETE FROM messages WHERE expires_at <= NOW()");
    } catch (err) {
      console.error("[cleanup] error:", err?.message || err);
    }
  }, 5 * 60 * 1000);
}

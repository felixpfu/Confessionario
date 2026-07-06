import { cleanupExpiredMessages } from "./messages.store.js";

export function startCleanupJob() {
  setInterval(async () => {
    try {
      await cleanupExpiredMessages();
    } catch (err) {
      console.error("[cleanup] error:", err?.message || err);
    }
  }, 5 * 60 * 1000);
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const REQUEST_TIMEOUT_MS = 8000;

async function requestJson(path, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const r = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal
    });

    let data = null;
    try {
      data = await r.json();
    } catch {
      data = null;
    }

    if (!r.ok) {
      throw new Error(data?.error || "Falha na comunicação com o servidor");
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Servidor não respondeu. Verifique se a API está rodando.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchMessages() {
  return requestJson("/messages");
}

export async function postMessage({ content, ttlSeconds }) {
  return requestJson("/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, ttlSeconds })
  });
}

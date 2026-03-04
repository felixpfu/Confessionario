const API_BASE = "http://10.10.29.132:3001";

export async function fetchMessages() {
  const r = await fetch(`${API_BASE}/messages`);
  if (!r.ok) throw new Error("Falha ao carregar mensagens");
  return r.json();
}

export async function postMessage({ content, ttlSeconds }) {
  const r = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, ttlSeconds })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Falha ao enviar");
  return data;
}

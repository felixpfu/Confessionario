import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchMessages, postMessage } from "./api.js";

const TTL_OPTIONS = [
  { label: "10 min", value: 600 },
  { label: "1 hora", value: 3600 },
  { label: "24 horas", value: 86400 }
];

const MAX_LEN = 999;

function timeLeftLabel(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(ms)) return "—";
  if (ms <= 0) return "expirada";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function Splash({ onDone }) {
  const [loading, setLoading] = useState(false);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const ANIM_MS = 2800;    
    const LOADER_MS = 2500;  

    const t0 = setTimeout(() => setRun(true), 30);
    const t1 = setTimeout(() => setLoading(true), ANIM_MS);               
    const t2 = setTimeout(() => onDone(), ANIM_MS + LOADER_MS);           

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className="splash">
      {!loading ? (
        <div className={"splashTitleAnim" + (run ? " run" : "")}>
          <div className="splashKicker">Confessionário online</div>
          <div className="splashSub">Escreva anonimamente. Tudo some com o tempo.</div>
        </div>
      ) : (
        <div className="splashLoader" aria-label="Carregando">
          <div className="loaderDot" />
          <div className="loaderDot" />
          <div className="loaderDot" />
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState(3600);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await fetchMessages();
      setMessages(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Falha ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setMessages((m) => [...m]), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = useMemo(() => MAX_LEN - content.length, [content.length]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    try {
      const created = await postMessage({ content, ttlSeconds });
      setContent("");
      setMessages((prev) => [created, ...prev]);
    } catch (e2) {
      alert(e2?.message || "Erro ao enviar");
    } finally {
      setSending(false);
    }
  }

  const now = Date.now();
  const visibleMessages = messages.filter((m) => {
    const exp = new Date(m.expiresAt).getTime();
    return Number.isFinite(exp) && exp > now;
  });

  const handleSplashDone = React.useCallback(() => setShowSplash(false), []);

  if (showSplash) {
    return <Splash onDone={handleSplashDone} />;

  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Bem-vindo ao Confessionário Online</h1>
          <p>Escreva anonimamente. Tudo aqui some com o passar do tempo.</p>
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Escrever</h2>

          <form onSubmit={onSubmit} className="form">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
              placeholder="Diga o que quiser…"
              rows={9}
            />

            <div className="row">
              <div className="small">
                <span className={remaining < 30 ? "warn" : ""}>
                  {remaining} caracteres
                </span>
              </div>

              <select
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(Number(e.target.value))}
              >
                {TTL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <button className="btnPrimary" disabled={sending || !content.trim()}>
                {sending ? "Enviando..." : "Publicar"}
              </button>
            </div>

            {error ? <div className="error">{error}</div> : null}

            <div className="hint">
              ⚠ ATENÇÃO! ⚠ : NÃO ESCREVA NADA QUE POSSA TE IDENTIFICAR. A FINALIDADE DO CONFESSIONÁRIO É SER ANÔNIMO E PÚBLICO.
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Feed público</h2>

          {loading ? (
            <p className="muted">Carregando…</p>
          ) : visibleMessages.length === 0 ? (
            <p className="muted">Nada por aqui ainda.</p>
          ) : (
            <div className="feed">
              {visibleMessages.map((m) => (
                <article key={m.id} className="msg">
                  <div className="msgTop">
                    <span className="pill">
                      Essa confissão irá desaparecer em… {timeLeftLabel(m.expiresAt)}
                    </span>
                  </div>

                  <div className="muted msgMeta">
                    {new Date(m.expiresAt).toLocaleString()}
                  </div>

                  <p className="msgText">{m.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON messages (expires_at);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);

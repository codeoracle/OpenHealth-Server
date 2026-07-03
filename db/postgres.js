const { Pool } = require("pg");

// Render/most managed Postgres require SSL. Allow opting out for local Postgres.
const ssl =
  process.env.DATABASE_SSL === "false"
    ? false
    : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

// Return timestamps in the same "YYYY-MM-DD HH:MI:SS" (UTC) shape SQLite uses,
// so the frontend can treat both identically.
const CREATED_AT = `to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') AS created_at`;

const init = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      age_range TEXT NOT NULL,
      gender TEXT NOT NULL,
      symptoms_check TEXT,
      causes TEXT,
      treatment TEXT,
      triage_level TEXT,
      triage_reason TEXT,
      tool_type TEXT DEFAULT 'symptom',
      provider TEXT,
      is_demo INTEGER DEFAULT 0,
      state TEXT DEFAULT 'Nigeria',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);
  `);
};

const logStatus = async () => {
  const { rows: sessionRows } = await pool.query(`SELECT COUNT(*)::int AS n FROM sessions`);
  const { rows: messageRows } = await pool.query(`SELECT COUNT(*)::int AS n FROM messages`);

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  OpenHealth — Database");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Status     : connected`);
  console.log(`  Engine     : PostgreSQL`);
  console.log(`  Sessions   : ${sessionRows[0].n} row(s)`);
  console.log(`  Messages   : ${messageRows[0].n} row(s)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
};

const createSession = async (data) => {
  await pool.query(
    `INSERT INTO sessions (
      id, full_name, symptoms, age_range, gender,
      symptoms_check, causes, treatment,
      triage_level, triage_reason, tool_type,
      provider, is_demo
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      data.id,
      data.fullName,
      data.symptoms,
      data.ageRange,
      data.gender,
      data.symptomsCheck,
      data.causes,
      data.treatment,
      data.triageLevel,
      data.triageReason,
      data.toolType,
      data.provider,
      data.isDemo,
    ]
  );
};

const getSession = async (id) => {
  const { rows } = await pool.query(
    `SELECT *, ${CREATED_AT} FROM sessions WHERE id = $1`,
    [id]
  );
  return rows[0];
};

const listSessions = async (limit) => {
  const { rows } = await pool.query(
    `SELECT id, full_name, symptoms, age_range, gender, tool_type, triage_level, is_demo, ${CREATED_AT}
     FROM sessions ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
};

const addMessage = async (sessionId, role, content) => {
  await pool.query(
    `INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)`,
    [sessionId, role, content]
  );
};

const getMessages = async (sessionId) => {
  const { rows } = await pool.query(
    `SELECT id, role, content, ${CREATED_AT} FROM messages
     WHERE session_id = $1 ORDER BY created_at ASC`,
    [sessionId]
  );
  return rows;
};

const touchSession = async (id) => {
  await pool.query(`UPDATE sessions SET updated_at = now() WHERE id = $1`, [id]);
};

module.exports = {
  kind: "postgres",
  describe: "PostgreSQL (DATABASE_URL)",
  init,
  logStatus,
  createSession,
  getSession,
  listSessions,
  addMessage,
  getMessages,
  touchSession,
};

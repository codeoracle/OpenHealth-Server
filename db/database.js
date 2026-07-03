const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "openhealth.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
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
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);
`);

const migrate = () => {
  const columns = db.prepare("PRAGMA table_info(sessions)").all().map((c) => c.name);
  const addColumn = (name, def) => {
    if (!columns.includes(name)) {
      db.exec(`ALTER TABLE sessions ADD COLUMN ${name} ${def}`);
    }
  };
  addColumn("triage_level", "TEXT");
  addColumn("triage_reason", "TEXT");
  addColumn("tool_type", "TEXT DEFAULT 'symptom'");
};

migrate();

const createSession = db.prepare(`
  INSERT INTO sessions (
    id, full_name, symptoms, age_range, gender,
    symptoms_check, causes, treatment,
    triage_level, triage_reason, tool_type,
    provider, is_demo
  ) VALUES (
    @id, @fullName, @symptoms, @ageRange, @gender,
    @symptomsCheck, @causes, @treatment,
    @triageLevel, @triageReason, @toolType,
    @provider, @isDemo
  )
`);

const getSession = db.prepare(`SELECT * FROM sessions WHERE id = ?`);

const listSessions = db.prepare(`
  SELECT id, full_name, symptoms, age_range, gender, tool_type, triage_level, is_demo, created_at
  FROM sessions ORDER BY created_at DESC LIMIT ?
`);

const addMessage = db.prepare(`
  INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)
`);

const getMessages = db.prepare(`
  SELECT id, role, content, created_at FROM messages
  WHERE session_id = ? ORDER BY created_at ASC
`);

const touchSession = db.prepare(`
  UPDATE sessions SET updated_at = datetime('now') WHERE id = ?
`);

module.exports = {
  db,
  dbPath,
  createSession,
  getSession,
  listSessions,
  addMessage,
  getMessages,
  touchSession,
};

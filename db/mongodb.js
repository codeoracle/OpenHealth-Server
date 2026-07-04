const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

const sessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  symptoms: { type: String, required: true },
  age_range: { type: String, required: true },
  gender: { type: String, required: true },
  symptoms_check: String,
  causes: String,
  treatment: String,
  triage_level: String,
  triage_reason: String,
  tool_type: { type: String, default: "symptom" },
  provider: String,
  is_demo: { type: Number, default: 0 },
  client_id: { type: String, index: true },
  state: { type: String, default: "Nigeria" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

sessionSchema.index({ created_at: -1 });
sessionSchema.index({ client_id: 1, created_at: -1 });

const messageSchema = new mongoose.Schema({
  session_id: { type: String, required: true, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

messageSchema.index({ session_id: 1, created_at: 1 });

const Session = mongoose.model("Session", sessionSchema);
const Message = mongoose.model("Message", messageSchema);

const toSessionRow = (doc) => {
  if (!doc) return null;
  const row = doc.toObject();
  return {
    ...row,
    created_at: formatTimestamp(row.created_at),
    updated_at: formatTimestamp(row.updated_at),
  };
};

const toMessageRow = (doc) => ({
  id: doc._id.toString(),
  role: doc.role,
  content: doc.content,
  created_at: formatTimestamp(doc.created_at),
});

const init = async () => {
  await mongoose.connect(uri);
  await Session.init();
  await Message.init();
};

const logStatus = async () => {
  const { host, name: dbName } = mongoose.connection;
  const [sessionCount, messageCount] = await Promise.all([
    Session.countDocuments(),
    Message.countDocuments(),
  ]);

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  OpenHealth — Database");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Status     : connected`);
  console.log(`  Engine     : MongoDB Atlas`);
  console.log(`  Host       : ${host}`);
  console.log(`  Database   : ${dbName}`);
  console.log(`  Sessions   : ${sessionCount} document(s)`);
  console.log(`  Messages   : ${messageCount} document(s)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
};

const createSession = async (data) => {
  await Session.create({
    id: data.id,
    full_name: data.fullName,
    symptoms: data.symptoms,
    age_range: data.ageRange,
    gender: data.gender,
    symptoms_check: data.symptomsCheck,
    causes: data.causes,
    treatment: data.treatment,
    triage_level: data.triageLevel,
    triage_reason: data.triageReason,
    tool_type: data.toolType,
    provider: data.provider,
    is_demo: data.isDemo,
    client_id: data.clientId,
  });
};

const getSession = async (id) => toSessionRow(await Session.findOne({ id }));

const listSessions = async (limit, clientId) => {
  const rows = await Session.find(
    { client_id: clientId },
    "id full_name symptoms age_range gender tool_type triage_level is_demo created_at"
  )
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  return rows.map((row) => ({
    ...row,
    created_at: formatTimestamp(row.created_at),
  }));
};

const addMessage = async (sessionId, role, content) => {
  await Message.create({ session_id: sessionId, role, content });
};

const getMessages = async (sessionId) => {
  const rows = await Message.find({ session_id: sessionId }).sort({ created_at: 1 });
  return rows.map(toMessageRow);
};

const touchSession = async (id) => {
  await Session.updateOne({ id }, { updated_at: new Date() });
};

const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");

module.exports = {
  kind: "mongodb",
  describe: maskedUri,
  init,
  logStatus,
  createSession,
  getSession,
  listSessions,
  addMessage,
  getMessages,
  touchSession,
};

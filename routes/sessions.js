const express = require("express");
const crypto = require("crypto");
const { complete, chat } = require("../services/llm");
const { HEALTH_TOOLS } = require("../data/nigeria-health");
const {
  createSession,
  getSession,
  listSessions,
  addMessage,
  getMessages,
  touchSession,
} = require("../db/database");

const router = express.Router();

const buildPrompts = ({ symptoms, ageRange, gender }) => ({
  symptomsCheck: `I would appreciate your help in providing some suggestions or insights. My symptoms include:\n symptoms: ${symptoms}\n age range: ${ageRange}\n gender: ${gender}. Make sure to summarize the response to 70 words`,
  causes: `What could be the possible causes of these symptoms?\n symptoms: ${symptoms}\n age range: ${ageRange}\n gender: ${gender}. Make sure to summarize the response to 70 words`,
  treatment: `What to do next if I notice these symptoms?\n symptoms: ${symptoms}\n age range: ${ageRange}\n gender: ${gender}. Make sure to summarize the response to 70 words`,
  triage: `You are a triage assistant in Nigeria. Patient: ${gender}, age ${ageRange}, symptoms: ${symptoms}. ` +
    `Rate urgency as exactly one word: emergency, high, medium, or low. ` +
    `Then give one sentence reason. Format: LEVEL: <word> | REASON: <sentence>`,
});

const parseTriage = (text) => {
  const levelMatch = text.match(/LEVEL:\s*(emergency|high|medium|low)/i);
  const reasonMatch = text.match(/REASON:\s*(.+)/i);
  return {
    level: levelMatch ? levelMatch[1].toLowerCase() : "medium",
    reason: reasonMatch ? reasonMatch[1].trim() : "Please consult a healthcare provider for assessment.",
  };
};

const formatSession = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    symptoms: row.symptoms,
    ageRange: row.age_range,
    gender: row.gender,
    symptomsCheck: row.symptoms_check,
    causes: row.causes,
    treatment: row.treatment,
    triageLevel: row.triage_level,
    triageReason: row.triage_reason,
    toolType: row.tool_type || "symptom",
    provider: row.provider,
    isDemo: Boolean(row.is_demo),
    state: row.state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const buildSystemPrompt = (session) =>
  `You are OpenHealth, a compassionate health assistant built for Nigeria. ` +
  `Patient: ${session.full_name}, age ${session.age_range}, gender ${session.gender}. ` +
  `Reported symptoms: ${session.symptoms}. ` +
  `Initial assessment — Suggestion: ${session.symptoms_check}. Causes: ${session.causes}. Next steps: ${session.treatment}. ` +
  `Answer follow-up questions clearly and empathetically. Reference common Nigerian health context (malaria, typhoid, sickle cell, primary health centres). ` +
  `Always advise seeing a doctor for serious, worsening, or persistent symptoms. ` +
  `For emergencies tell them to call 112 or 199. Keep responses under 120 words. This is not a diagnosis.`;

router.post("/askai", async (req, res) => {
  const { symptoms, ageRange, gender, fullName } = req.body;

  if (!symptoms || !ageRange || !gender || !fullName) {
    return res.status(400).json({
      message: "fullName, symptoms, ageRange, and gender are required",
    });
  }

  const prompts = buildPrompts({ symptoms, ageRange, gender });

  try {
    const [symptomsResult, causesResult, treatmentResult, triageResult] =
      await Promise.all([
        complete(prompts.symptomsCheck),
        complete(prompts.causes),
        complete(prompts.treatment),
        complete(prompts.triage),
      ]);

    const triage = parseTriage(triageResult.content);
    const sessionId = crypto.randomUUID();
    const providersUsed = [
      ...new Set([
        symptomsResult.provider,
        causesResult.provider,
        treatmentResult.provider,
      ]),
    ];
    const isDemo = [symptomsResult, causesResult, treatmentResult].some(
      (r) => r.isDemo
    );

    await createSession({
      id: sessionId,
      fullName,
      symptoms,
      ageRange: String(ageRange),
      gender,
      symptomsCheck: symptomsResult.content,
      causes: causesResult.content,
      treatment: treatmentResult.content,
      triageLevel: triage.level,
      triageReason: triage.reason,
      toolType: "symptom",
      provider: providersUsed.join(","),
      isDemo: isDemo ? 1 : 0,
    });

    res.status(200).json({
      message: isDemo
        ? "Demo response — add Groq API key or billing credits for live AI"
        : "Request successful!",
      isDemo,
      sessionId,
      provider: providersUsed.length === 1 ? providersUsed[0] : providersUsed,
      data: {
        fullName,
        symptomsCheck: symptomsResult.content,
        causes: causesResult.content,
        treatment: treatmentResult.content,
        triageLevel: triage.level,
        triageReason: triage.reason,
      },
    });
  } catch (error) {
    console.error("Symptom check error:", error.message);
    res.status(503).json({
      message: error.message || "Unable to generate health insights.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const rows = await listSessions(limit);
    res.json({
      sessions: rows.map((row) => ({
        id: row.id,
        fullName: row.full_name,
        symptoms: row.symptoms,
        ageRange: row.age_range,
        gender: row.gender,
        toolType: row.tool_type || "symptom",
        triageLevel: row.triage_level,
        isDemo: Boolean(row.is_demo),
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("List sessions error:", error.message);
    res.status(500).json({ message: "Unable to load sessions." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const session = await getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const messages = await getMessages(req.params.id);
    res.json({
      session: formatSession(session),
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error("Get session error:", error.message);
    res.status(500).json({ message: "Unable to load session." });
  }
});

router.post("/:id/chat", async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ message: "message is required" });
  }

  try {
    const session = await getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    await addMessage(req.params.id, "user", message.trim());

    const history = await getMessages(req.params.id);
    const llmMessages = [
      { role: "system", content: buildSystemPrompt(session) },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ];

    const result = await chat(llmMessages);
    await addMessage(req.params.id, "assistant", result.content);
    await touchSession(req.params.id);

    res.json({
      message: "Reply generated",
      isDemo: result.isDemo,
      provider: result.provider,
      reply: result.content,
    });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(503).json({
      message: error.message || "Unable to generate a reply.",
    });
  }
});

module.exports = router;

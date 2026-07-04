const express = require("express");
const crypto = require("crypto");
const { complete } = require("../services/llm");
const { HEALTH_TOOLS } = require("../data/nigeria-health");
const { createSession } = require("../db/database");
const { requireClientId } = require("../middleware/client");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    tools: HEALTH_TOOLS.map(({ id, title, description, icon, problem }) => ({
      id,
      title,
      description,
      icon,
      problem,
    })),
  });
});

router.get("/:toolId", (req, res) => {
  const tool = HEALTH_TOOLS.find((t) => t.id === req.params.toolId);
  if (!tool) {
    return res.status(404).json({ message: "Tool not found" });
  }
  res.json({
    tool: {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      icon: tool.icon,
      problem: tool.problem,
      fields: tool.fields,
    },
  });
});

router.post("/:toolId", async (req, res) => {
  const clientId = requireClientId(req, res);
  if (!clientId) return;

  const tool = HEALTH_TOOLS.find((t) => t.id === req.params.toolId);
  if (!tool) {
    return res.status(404).json({ message: "Tool not found" });
  }

  const missing = tool.fields
    .filter((f) => f.required && !req.body[f.name]?.trim())
    .map((f) => f.name);

  if (missing.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  try {
    const prompt = tool.prompt(req.body);
    const result = await complete(prompt);
    const sessionId = crypto.randomUUID();

    const symptomsSummary = Object.entries(req.body)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");

    await createSession({
      id: sessionId,
      clientId,
      fullName: req.body.fullName || "Anonymous",
      symptoms: symptomsSummary,
      ageRange: req.body.ageRange || req.body.childAge || req.body.weeksPregnant || "N/A",
      gender: req.body.gender || "N/A",
      symptomsCheck: result.content,
      causes: "",
      treatment: "",
      triageLevel: null,
      triageReason: null,
      toolType: tool.id,
      provider: result.provider,
      isDemo: result.isDemo ? 1 : 0,
    });

    res.json({
      message: "Assessment complete",
      isDemo: result.isDemo,
      sessionId,
      provider: result.provider,
      data: {
        fullName: req.body.fullName || "Anonymous",
        toolType: tool.id,
        toolTitle: tool.title,
        assessment: result.content,
      },
    });
  } catch (error) {
    console.error(`Tool ${req.params.toolId} error:`, error.message);
    res.status(503).json({ message: error.message || "Unable to complete assessment." });
  }
});

module.exports = router;

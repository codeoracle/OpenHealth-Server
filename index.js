require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { getProviderStatus } = require("./services/llm");
const { dbPath } = require("./db/database");
const sessionsRouter = require("./routes/sessions");
const nigeriaRouter = require("./routes/nigeria");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) => {
  const status = getProviderStatus();
  const hasProvider = Object.values(status.providers).some((p) => p.configured);

  res.status(hasProvider ? 200 : 503).json({
    status: hasProvider ? "ok" : "degraded",
    message: hasProvider ? "Server is running" : "No LLM provider configured",
    database: dbPath,
    llm: status,
  });
});

app.use("/symptoms", sessionsRouter);
app.use("/tools", require("./routes/tools"));
app.use("/nigeria", nigeriaRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  const status = getProviderStatus();
  console.log(`Server listening on port ${PORT}`);
  console.log(`Database: ${dbPath}`);
  console.log(`LLM provider order: ${status.order.join(" → ")}`);
  console.log(
    `Groq (free): ${status.providers.groq.configured ? "ready" : "not configured"}`
  );
  console.log(
    `OpenAI: ${status.providers.openai.configured ? "ready" : "not configured"}`
  );
  console.log(
    `Claude: ${status.providers.claude.configured ? "ready" : "not configured"}`
  );
  console.log(
    `Mock fallback: ${status.providers.mock.configured ? "enabled" : "disabled"}`
  );
});

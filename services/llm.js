const { OpenAI } = require("openai");
const Anthropic = require("@anthropic-ai/sdk");

let openaiClient = null;
let anthropicClient = null;
let groqClient = null;

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const getAnthropicClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
};

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return groqClient;
};

const getOpenAIModel = () => process.env.OPENAI_MODEL || "gpt-4o-mini";
const getClaudeModel = () =>
  process.env.CLAUDE_MODEL || "claude-3-5-haiku-20241022";
const getGroqModel = () =>
  process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const isOpenAIConfigured = () => Boolean(process.env.OPENAI_API_KEY);
const isClaudeConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);
const isGroqConfigured = () => Boolean(process.env.GROQ_API_KEY);
const isMockEnabled = () =>
  (process.env.ENABLE_MOCK_LLM || "true").toLowerCase() === "true";

const getProviderOrder = () => {
  if (process.env.LLM_PROVIDERS) {
    return process.env.LLM_PROVIDERS.split(",")
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);
  }
  return ["groq", "openai", "claude", "mock"];
};

const extractSymptoms = (message) => {
  const match = message.match(/symptoms:\s*(.+?)(?:\n| age range:)/i);
  return match?.[1]?.trim() || "your reported symptoms";
};

const completeWithOpenAI = async (message) => {
  const client = getOpenAIClient();
  if (!client) throw new Error("OpenAI API key is not configured");

  const response = await client.chat.completions.create({
    model: getOpenAIModel(),
    messages: [{ role: "user", content: message }],
    temperature: 0.7,
    max_tokens: 150,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI returned an empty response");
  return content;
};

const completeWithClaude = async (message) => {
  const client = getAnthropicClient();
  if (!client) throw new Error("Anthropic API key is not configured");

  const response = await client.messages.create({
    model: getClaudeModel(),
    max_tokens: 150,
    messages: [{ role: "user", content: message }],
  });

  const content = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!content) throw new Error("Claude returned an empty response");
  return content;
};

const completeWithGroq = async (message) => {
  const client = getGroqClient();
  if (!client) throw new Error("Groq API key is not configured");

  const response = await client.chat.completions.create({
    model: getGroqModel(),
    messages: [{ role: "user", content: message }],
    temperature: 0.7,
    max_tokens: 150,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned an empty response");
  return content;
};

const completeWithMock = async (message) => {
  const symptoms = extractSymptoms(message);

  if (message.includes("possible causes")) {
    return `Based on ${symptoms}, common causes may include viral infections, allergies, stress, dehydration, or mild inflammation. These symptoms can overlap across conditions, so patterns like duration, severity, and fever matter. This is general guidance only — a clinician should evaluate persistent or worsening symptoms.`;
  }

  if (message.includes("What to do next")) {
    return `For ${symptoms}, rest, stay hydrated, and monitor changes over 24–48 hours. Seek urgent care if you develop chest pain, breathing difficulty, confusion, or a high fever. Otherwise, book a doctor visit if symptoms persist or worsen. Avoid self-medicating without professional advice.`;
  }

  return `For ${symptoms}, early assessment is important. Track when symptoms started, their severity, and any triggers. Mild cases often improve with rest and fluids, but ongoing or severe symptoms warrant medical review. This summary is informational, not a diagnosis.`;
};

const chatWithOpenAI = async (messages) => {
  const client = getOpenAIClient();
  if (!client) throw new Error("OpenAI API key is not configured");

  const response = await client.chat.completions.create({
    model: getOpenAIModel(),
    messages,
    temperature: 0.7,
    max_tokens: 250,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI returned an empty response");
  return content;
};

const chatWithClaude = async (messages) => {
  const client = getAnthropicClient();
  if (!client) throw new Error("Anthropic API key is not configured");

  const system = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const response = await client.messages.create({
    model: getClaudeModel(),
    max_tokens: 250,
    system: system?.content || undefined,
    messages: chatMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  });

  const content = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!content) throw new Error("Claude returned an empty response");
  return content;
};

const chatWithGroq = async (messages) => {
  const client = getGroqClient();
  if (!client) throw new Error("Groq API key is not configured");

  const response = await client.chat.completions.create({
    model: getGroqModel(),
    messages,
    temperature: 0.7,
    max_tokens: 250,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned an empty response");
  return content;
};

const chatWithMock = async (messages) => {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.content || "";

  if (/emergency|urgent|severe|dying/i.test(question)) {
    return "If this is an emergency, call 112 or 199 immediately and go to the nearest hospital. Do not wait for online advice. For non-emergency concerns, visit your nearest primary health centre or general hospital.";
  }

  if (/malaria|fever|typhoid|cholera/i.test(question)) {
    return "In Nigeria, fever with body aches may indicate malaria or typhoid — both are common and treatable. Please visit a primary health centre for a rapid diagnostic test within 24 hours. Early treatment prevents complications. This is general guidance, not a diagnosis.";
  }

  if (/drug|medicine|pharmacy|chemist/i.test(question)) {
    return "Only buy medicines from registered pharmacies (chemists) with a NAFDAC-licensed pharmacist. Avoid unregulated street vendors. Always follow your doctor's prescription and complete the full course. Verify drugs at nafdac.gov.ng if unsure.";
  }

  return "Thank you for your follow-up question. Based on your earlier symptoms, I recommend monitoring how you feel over the next 24–48 hours. If symptoms worsen, persist beyond 3 days, or you develop fever, difficulty breathing, or severe pain, please visit a hospital or primary health centre. This is informational guidance for Nigeria — not a substitute for seeing a doctor.";
};

const providerHandlers = {
  openai: {
    name: "openai",
    isConfigured: isOpenAIConfigured,
    complete: completeWithOpenAI,
    chat: chatWithOpenAI,
  },
  claude: {
    name: "claude",
    isConfigured: isClaudeConfigured,
    complete: completeWithClaude,
    chat: chatWithClaude,
  },
  groq: {
    name: "groq",
    isConfigured: isGroqConfigured,
    complete: completeWithGroq,
    chat: chatWithGroq,
  },
  mock: {
    name: "mock",
    isConfigured: isMockEnabled,
    complete: completeWithMock,
    chat: chatWithMock,
  },
};

const runWithFailover = async (fnName, arg) => {
  const attempts = getProviderOrder();
  const errors = [];

  for (const providerName of attempts) {
    const provider = providerHandlers[providerName];
    if (!provider) {
      errors.push(`${providerName}: unknown provider`);
      continue;
    }
    if (!provider.isConfigured()) {
      errors.push(`${providerName}: not configured`);
      continue;
    }

    try {
      const content = await provider[fnName](arg);
      console.log(`LLM ${fnName} via ${providerName}`);
      return {
        content,
        provider: providerName,
        isDemo: providerName === "mock",
      };
    } catch (error) {
      const errorMessage = error?.message || "Unknown error";
      console.error(`${providerName} failed:`, errorMessage);
      errors.push(`${providerName}: ${errorMessage}`);
    }
  }

  throw new Error(`All LLM providers failed. ${errors.join(" | ")}`);
};

const complete = async (message) => runWithFailover("complete", message);

const chat = async (messages) => runWithFailover("chat", messages);

const getProviderStatus = () => {
  const order = getProviderOrder();
  return {
    order,
    providers: {
      openai: {
        configured: isOpenAIConfigured(),
        model: getOpenAIModel(),
      },
      claude: {
        configured: isClaudeConfigured(),
        model: getClaudeModel(),
      },
      groq: {
        configured: isGroqConfigured(),
        model: getGroqModel(),
        freeTier: true,
      },
      mock: {
        configured: isMockEnabled(),
        note: "Demo responses when paid APIs have no credits",
      },
    },
  };
};

module.exports = {
  complete,
  chat,
  getProviderStatus,
  isOpenAIConfigured,
  isClaudeConfigured,
  isGroqConfigured,
};

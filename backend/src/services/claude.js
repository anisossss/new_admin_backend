import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error("ANTHROPIC_API_KEY is not configured. Add it to backend/.env");
    err.status = 503;
    throw err;
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function firstText(message) {
  const block = message.content.find((b) => b.type === "text");
  return block ? block.text : "";
}

// Long output → stream + finalMessage (avoids HTTP timeouts)
export async function generateStructured({ system, prompt, schema, maxTokens = 64000 }) {
  const client = getClient();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system,
    messages: [{ role: "user", content: prompt }],
    output_config: { format: { type: "json_schema", schema } },
  });
  const message = await stream.finalMessage();
  return JSON.parse(firstText(message));
}

export async function generateText({ system, prompt, maxTokens = 16000 }) {
  const client = getClient();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const message = await stream.finalMessage();
  return firstText(message);
}

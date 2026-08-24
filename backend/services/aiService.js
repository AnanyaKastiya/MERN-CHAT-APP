const { GoogleGenAI } = require("@google/genai");

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Attempts generation using modern Gemini models with automatic fallback.
 */
const generateWithFallback = async (ai, contents) => {
  const models = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"];
  let lastError;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Model ${model} unavailable, trying fallback... Error:`, err.message);
    }
  }

  throw lastError || new Error("Failed to generate content with available Gemini models.");
};

/**
 * Summarizes a list of chat messages into structured JSON.
 * @param {Array<{sender: {name: string}, content: string, createdAt: string}>} messages
 */
const summarizeConversation = async (messages) => {
  if (!messages || messages.length === 0) {
    return {
      overview: "No messages to summarize in this conversation yet.",
      keyTopics: [],
      decisions: [],
      actionItems: [],
      sentiment: "Neutral",
      messageCount: 0,
    };
  }

  const transcript = messages
    .map((m) => {
      const senderName = m.sender?.name || "Unknown";
      const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
      return `[${time}] ${senderName}: ${m.content}`;
    })
    .join("\n");

  const prompt = `You are an AI assistant in a modern team chat application.
Analyze the following chat transcript and provide a structured, high-value summary.

CHAT TRANSCRIPT:
${transcript}

INSTRUCTIONS:
Return a valid JSON object matching this exact schema:
{
  "overview": "A crisp 1-2 sentence executive summary of the conversation.",
  "keyTopics": ["Topic 1", "Topic 2", ...],
  "decisions": ["Decision 1", "Decision 2", ...],
  "actionItems": ["Action item with assignee or next step", ...],
  "sentiment": "e.g. Productive, Planning, Casual, Urgent, etc."
}

If there are no explicit decisions or action items, return empty arrays [].
Respond ONLY with the raw JSON object, without any surrounding markdown code fences.`;

  const ai = getAiClient();
  const response = await generateWithFallback(ai, prompt);

  let text = response.text ? response.text.trim() : "";
  // Strip any markdown code block wrappers if present
  if (text.startsWith("```json")) {
    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (text.startsWith("```")) {
    text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      messageCount: messages.length,
    };
  } catch (err) {
    return {
      overview: text || "Summary generated.",
      keyTopics: ["Discussion"],
      decisions: [],
      actionItems: [],
      sentiment: "Active",
      messageCount: messages.length,
    };
  }
};

/**
 * Handles @ai in-chat prompts with conversational context.
 * @param {string} userPrompt
 * @param {Array<{sender: {name: string}, content: string}>} recentMessages
 */
const generateAiReply = async (userPrompt, recentMessages = []) => {
  const contextSnippet = recentMessages
    .slice(-10)
    .map((m) => `${m.sender?.name || "User"}: ${m.content}`)
    .join("\n");

  const prompt = `You are "Linkify AI", a helpful, intelligent, and concise AI assistant embedded directly into this chat room.
Context of recent messages in this chat:
${contextSnippet || "No prior messages."}

User query:
"${userPrompt}"

Guidelines:
- Keep your response helpful, friendly, and concise (ideal for a chat app).
- Use formatting (bullet points, bold text) if explaining steps or lists.
- If asked to do tasks (e.g. summarize, write a draft, answer a tech question, solve a bug), do it directly.`;

  const ai = getAiClient();
  const response = await generateWithFallback(ai, prompt);

  return response.text ? response.text.trim() : "I couldn't generate a response.";
};

module.exports = {
  summarizeConversation,
  generateAiReply,
};

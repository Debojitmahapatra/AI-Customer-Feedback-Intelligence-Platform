import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const classificationSystemPrompt = `
You classify customer feedback for a product team.

Analyze only the supplied feedback and return only valid JSON with this exact structure:
{
  "sentiment": "positive" | "neutral" | "negative",
  "sentimentScore": number between -1 and 1,
  "themes": ["concise theme names"],
  "featureArea": "relevant product area" or null
}

Use no Markdown, no code fences, and no explanation outside the JSON.
Return no more than 5 concise themes.
`;

const createHttpError = (message, statusCode = 503) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const getEnvironmentValue = (name) => {
  const value = process.env[name];

  if (!value) {
    throw createHttpError(`${name} is not configured.`);
  }

  return value;
};

const getProvider = () => {
  const provider = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
  const supportedProviders = ["anthropic", "gemini", "groq", "openrouter"];

  if (!supportedProviders.includes(provider)) {
    throw createHttpError("Unsupported AI provider.");
  }

  return provider;
};

const getUserPrompt = (feedbackContent) =>
  `Feedback to classify:\n${feedbackContent}`;

const getTextFromGroqResponse = (response) => {
  const text = response.choices?.[0]?.message?.content;

  if (!text) {
    throw createHttpError("AI provider returned no text.", 502);
  }

  return text;
};

const requestFromAnthropic = async (feedbackContent) => {
  const client = new Anthropic({
    apiKey: getEnvironmentValue("ANTHROPIC_API_KEY"),
  });

  const response = await client.messages.create({
    model: getEnvironmentValue("ANTHROPIC_MODEL"),
    max_tokens: 250,
    system: classificationSystemPrompt,
    messages: [
      {
        role: "user",
        content: getUserPrompt(feedbackContent),
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock) {
    throw createHttpError("AI provider returned no text.", 502);
  }

  return textBlock.text;
};

const requestFromGemini = async (feedbackContent) => {
  const client = new GoogleGenAI({
    apiKey: getEnvironmentValue("GEMINI_API_KEY"),
  });

  const response = await client.models.generateContent({
    model: getEnvironmentValue("GEMINI_MODEL"),
    contents: getUserPrompt(feedbackContent),
      config: {
          systemInstruction: classificationSystemPrompt,
          responseMimeType: "application/json",
          maxOutputTokens: 512,
          thinkingConfig: {
              thinkingLevel: "LOW",
          },
      },
  });

  if (!response.text) {
    throw createHttpError("AI provider returned no text.", 502);
  }

  return response.text;
};

const requestFromGroq = async (feedbackContent) => {
  const client = new Groq({
    apiKey: getEnvironmentValue("GROQ_API_KEY"),
  });

  const response = await client.chat.completions.create({
    model: getEnvironmentValue("GROQ_MODEL"),
    messages: [
      {
        role: "system",
        content: classificationSystemPrompt,
      },
      {
        role: "user",
        content: getUserPrompt(feedbackContent),
      },
    ],
  });

  return getTextFromGroqResponse(response);
};

const requestFromOpenRouter = async (feedbackContent) => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getEnvironmentValue("OPENROUTER_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getEnvironmentValue("OPENROUTER_MODEL"),
        messages: [
          {
            role: "system",
            content: classificationSystemPrompt,
          },
          {
            role: "user",
            content: getUserPrompt(feedbackContent),
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw createHttpError("OpenRouter classification request failed.", 502);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw createHttpError("AI provider returned no text.", 502);
  }

  return text;
};

export const requestClassification = async (feedbackContent) => {
  const provider = getProvider();

  if (provider === "anthropic") {
    return requestFromAnthropic(feedbackContent);
  }

  if (provider === "gemini") {
    return requestFromGemini(feedbackContent);
  }

  if (provider === "groq") {
    return requestFromGroq(feedbackContent);
  }

  return requestFromOpenRouter(feedbackContent);
};
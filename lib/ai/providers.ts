// lib/ai/providers.ts
import { createGroq } from "@ai-sdk/groq";

// Validate API key only on server-side
if (typeof window === 'undefined' && !process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not set in environment variables");
  throw new Error("GROQ_API_KEY environment variable is required");
}

// Create a Groq provider using official SDK
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const languageModels = {
  "chat-model": groq("llama-3.3-70b-versatile"),
  "chat-model-reasoning": groq("deepseek-r1-distill-llama-70b"),
  "kimi-k2": groq("llama-3.3-70b-versatile"),
  "meta-llama/llama-4-scout-17b-16e-instruct": groq(
    "llama-3.1-70b-versatile",
  ),
  "llama-3.1-8b-instant": groq("llama-3.1-8b-instant"),
  "deepseek-r1-distill-llama-70b": groq("deepseek-r1-distill-llama-70b"),
  "llama-3.3-70b-versatile": groq("llama-3.3-70b-versatile"),
  "title-model": groq("llama-3.1-8b-instant"),
  "artifact-model": groq("llama-3.3-70b-versatile"),
};

export const model = {
  languageModel: (modelId: string): any => {
    return languageModels[modelId as keyof typeof languageModels] || languageModels["chat-model"];
  }
};

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "llama-3.3-70b-versatile";

// Alias model as myProvider for backward compatibility
export const myProvider = model;

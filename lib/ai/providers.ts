// lib/ai/providers.ts
import { groq } from "@ai-sdk/groq";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";

// Validate API key only on server-side
if (typeof window === 'undefined' && !process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not set in environment variables");
  throw new Error("GROQ_API_KEY environment variable is required");
}

const languageModels = {
  "chat-model-lite": groq("llama-3.1-8b-instant"),
  "chat-model": groq("llama-3.3-70b-versatile"),
  "chat-model-reasoning": wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: "think",
    }),
    model: groq("deepseek-r1-distill-llama-70b"),
  }),
  "llama-3.1-8b-instant": groq("llama-3.1-8b-instant"),
  "deepseek-r1-distill-llama-70b": wrapLanguageModel({
    middleware: extractReasoningMiddleware({
      tagName: "think",
    }),
    model: groq("deepseek-r1-distill-llama-70b"),
  }),
  "llama-3.3-70b-versatile": groq("llama-3.3-70b-versatile"),
  "title-model": groq("llama-3.1-8b-instant"),
  "artifact-model": groq("llama-3.3-70b-versatile"),
};

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "chat-model";

// Alias model as myProvider for backward compatibility
export const myProvider = model;

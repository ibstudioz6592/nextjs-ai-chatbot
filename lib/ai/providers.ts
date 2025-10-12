// lib/ai/providers.ts
import { createGroq } from "@ai-sdk/groq";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";

// Server-side only: Get API key with rotation support
const getGroqProvider = () => {
  // Dynamically import rotation module on server-side
  const { getGroqApiKey } = require("./groq-key-rotation");
  const apiKey = getGroqApiKey();
  return createGroq({ apiKey });
};

// Lazy initialization - only create models when needed (server-side)
let cachedGroqProvider: ReturnType<typeof createGroq> | null = null;
const getGroqModel = (modelName: string) => {
  if (typeof window !== 'undefined') {
    // This should never be called on client-side, but return a dummy to prevent crashes
    throw new Error('getGroqModel should only be called on server-side');
  }
  
  if (!cachedGroqProvider) {
    cachedGroqProvider = getGroqProvider();
  }
  return cachedGroqProvider(modelName);
};

// Initialize models - safe for both client and server
const languageModels = typeof window === 'undefined' 
  ? {
      "chat-model-lite": getGroqModel("llama-3.1-8b-instant"),
      "chat-model": getGroqModel("llama-3.3-70b-versatile"),
      "chat-model-reasoning": wrapLanguageModel({
        middleware: extractReasoningMiddleware({
          tagName: "think",
        }),
        model: getGroqModel("deepseek-r1-distill-llama-70b"),
      }),
      "llama-3.1-8b-instant": getGroqModel("llama-3.1-8b-instant"),
      "deepseek-r1-distill-llama-70b": wrapLanguageModel({
        middleware: extractReasoningMiddleware({
          tagName: "think",
        }),
        model: getGroqModel("deepseek-r1-distill-llama-70b"),
      }),
      "llama-3.3-70b-versatile": getGroqModel("llama-3.3-70b-versatile"),
      "title-model": getGroqModel("llama-3.1-8b-instant"),
      "artifact-model": getGroqModel("llama-3.3-70b-versatile"),
    }
  : {} as any; // Client-side gets empty object with type assertion

export const model = customProvider({
  languageModels,
});

export type modelID = 
  | "chat-model-lite"
  | "chat-model"
  | "chat-model-reasoning"
  | "llama-3.1-8b-instant"
  | "deepseek-r1-distill-llama-70b"
  | "llama-3.3-70b-versatile"
  | "title-model"
  | "artifact-model";

export const MODELS = typeof window === 'undefined' 
  ? Object.keys(languageModels)
  : ["chat-model-lite", "chat-model", "chat-model-reasoning", "llama-3.1-8b-instant", "deepseek-r1-distill-llama-70b", "llama-3.3-70b-versatile", "title-model", "artifact-model"];

export const defaultModel: modelID = "chat-model";

// Alias model as myProvider for backward compatibility
export const myProvider = model;

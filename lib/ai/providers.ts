// lib/ai/providers.ts
import { createGroq } from "@ai-sdk/groq";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";

// Get API key with rotation support (server-side only)
const getGroqProvider = () => {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    throw new Error('Groq provider should only be used on the server-side');
  }
  
  // Dynamically import rotation module on server-side
  const { getGroqApiKey } = require("./groq-key-rotation");
  const apiKey = getGroqApiKey();
  return createGroq({ apiKey });
};

// Lazy initialization - only create models when needed (server-side)
let cachedGroqProvider: ReturnType<typeof createGroq> | null = null;
const getGroqModel = (modelName: string) => {
  if (!cachedGroqProvider) {
    cachedGroqProvider = getGroqProvider();
  }
  return cachedGroqProvider(modelName);
};

// Initialize models only on server-side
const initializeLanguageModels = () => {
  if (typeof window !== 'undefined') {
    // Return empty object on client-side - models are only used server-side
    return {} as Record<string, any>;
  }

  return {
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
  } as const;
};

const languageModels = initializeLanguageModels();

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "chat-model";

// Alias model as myProvider for backward compatibility
export const myProvider = model;

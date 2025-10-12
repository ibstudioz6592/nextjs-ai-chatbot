// lib/ai/providers.ts
import { createGroq } from "@ai-sdk/groq";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";

// Server-side only: Get API key with rotation support
const getGroqProvider = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Groq provider should only be used on server-side');
  }
  
  // Dynamically import rotation module on server-side
  const { getGroqApiKey } = require("./groq-key-rotation");
  const apiKey = getGroqApiKey();
  return createGroq({ apiKey });
};

// Create a wrapper that gets a fresh provider with rotated key for each model call
const createRotatingGroqModel = (modelName: string) => {
  if (typeof window !== 'undefined') {
    throw new Error('Model creation should only happen on server-side');
  }
  
  // Get a fresh provider with rotated API key
  const provider = getGroqProvider();
  return provider(modelName);
};

// Initialize models - safe for both client and server
const languageModels = typeof window === 'undefined' 
  ? {
      "chat-model-lite": createRotatingGroqModel("llama-3.1-8b-instant"),
      "chat-model": createRotatingGroqModel("llama-3.3-70b-versatile"),
      // Using fast 8B model for reasoning - faster responses with detailed thinking
      "chat-model-reasoning": wrapLanguageModel({
        middleware: extractReasoningMiddleware({
          tagName: "think",
        }),
        model: createRotatingGroqModel("llama-3.1-8b-instant"),
      }),
      "llama-3.1-8b-instant": createRotatingGroqModel("llama-3.1-8b-instant"),
      "deepseek-r1-distill-llama-70b": wrapLanguageModel({
        middleware: extractReasoningMiddleware({
          tagName: "think",
        }),
        model: createRotatingGroqModel("deepseek-r1-distill-llama-70b"),
      }),
      "llama-3.3-70b-versatile": createRotatingGroqModel("llama-3.3-70b-versatile"),
      "title-model": createRotatingGroqModel("llama-3.1-8b-instant"),
      "artifact-model": createRotatingGroqModel("llama-3.3-70b-versatile"),
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

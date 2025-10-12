// lib/ai/providers.ts
import { createGroq } from "@ai-sdk/groq";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { getGroqApiKey } from "./groq-key-rotation";

// Get API key with rotation support
const getGroqProvider = () => {
  const apiKey = getGroqApiKey();
  return createGroq({ apiKey });
};

// Create a function to get fresh groq instance with current key
const getGroqModel = (modelName: string) => {
  return getGroqProvider()(modelName);
};

const languageModels = {
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
};

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "chat-model";

// Alias model as myProvider for backward compatibility
export const myProvider = model;

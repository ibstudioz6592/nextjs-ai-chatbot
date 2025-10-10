import { 
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  createOpenAICompatible,
} from "ai";
import { isTestEnvironment } from "../constants";

// Create a custom model for Lynxa Pro API
const createLynxaModel = (modelId: string, streaming: boolean = false) => {
  return createOpenAICompatible({
    name: modelId,
    apiKey: process.env.LYNXA_API_KEY || "",
    baseURL: "https://lynxa-pro-backend.vercel.app/api/lynxa",
    headers: {
      "Authorization": `Bearer ${process.env.LYNXA_API_KEY || ""}`,
      "Content-Type": "application/json"
    },
    compatibility: "compatible",
  });
};

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model": createLynxaModel("lynxa-pro"),
        "chat-model-reasoning": wrapLanguageModel({
          model: createLynxaModel("lynxa-pro"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": createLynxaModel("lynxa-pro"),
        "artifact-model": createLynxaModel("lynxa-pro"),
      },
    });

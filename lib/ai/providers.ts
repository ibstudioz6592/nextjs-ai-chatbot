import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  LanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// Custom types to avoid unexported type errors
interface CustomPrompt {
  role: string;
  content: string | { type: string; text: string }[];
}

interface CustomContent {
  type: "text";
  text: string;
}

interface CustomUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface CustomGenerateResult {
  content: CustomContent[];
  finishReason: string;
  usage: CustomUsage;
  warnings: any[];
  providerMetadata?: any;
  request?: any;
  response?: any;
}

interface CustomStreamResult {
  stream: ReadableStream<CustomContent>;
  warnings: any[];
}

// Create a custom Groq language model
const createGroqModel = (modelId: string = "llama-3.3-70b-versatile"): LanguageModel => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  const API_KEY = process.env.GROQ_API_KEY;
  const BASE_URL = "https://api.groq.com/openai/v1";

  return {
    specificationVersion: "v2",
    provider: "groq",
    modelId,
    defaultObjectGenerationMode: "json",
    supportedUrlProtocols: ["https", "http"],
    supportedImageFormats: [], // Llama 3.3 70B is text-only
    supportedUseCases: ["chat", "reasoning"],

    doGenerate: async (params: any): Promise<CustomGenerateResult> => {
      try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelId,
            messages: params.prompt as CustomPrompt[],
            max_tokens: params.maxTokens || 1024,
            temperature: params.temperature || 0.7,
            top_p: params.topP || 1,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        // Validate response structure
        if (!result.choices || !Array.isArray(result.choices) || !result.choices[0]) {
          throw new Error("Invalid Groq API response: missing or invalid choices");
        }

        const choice = result.choices[0];
        const content: CustomContent[] = choice.message?.content
          ? [{ type: "text", text: choice.message.content }]
          : [];

        const usage: CustomUsage = {
          inputTokens: result.usage?.prompt_tokens || 0,
          outputTokens: result.usage?.completion_tokens || 0,
          totalTokens: (result.usage?.prompt_tokens || 0) + (result.usage?.completion_tokens || 0),
        };

        return {
          content,
          finishReason: choice.finish_reason || "stop",
          usage,
          warnings: [],
          providerMetadata: undefined,
          request: undefined,
          response: undefined,
        };
      } catch (error) {
        throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },

    doStream: async (params: any): Promise<CustomStreamResult> => {
      try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelId,
            messages: params.prompt as CustomPrompt[],
            max_tokens: params.maxTokens || 1024,
            temperature: params.temperature || 0.7,
            top_p: params.topP || 1,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response body reader");
        }

        const decoder = new TextDecoder();

        return {
          stream: new ReadableStream({
            async start(controller) {
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  const lines = chunk.split("\n");

                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      const data = line.slice(6);
                      if (data === "[DONE]") {
                        controller.close();
                        return;
                      }

                      try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices[0]?.delta?.content;
                        if (delta) {
                          controller.enqueue({ type: "text", text: delta } as CustomContent);
                        }
                      } catch (e) {
                        // Skip invalid JSON lines
                        console.warn(`Skipping invalid JSON in stream: ${data}`);
                      }
                    }
                  }
                }
              } catch (error) {
                controller.error(error instanceof Error ? error : new Error("Unknown streaming error"));
              } finally {
                reader.releaseLock();
              }
            },
          }),
          warnings: [],
        };
      } catch (error) {
        throw new Error(`Failed to stream response: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
  };
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
        "chat-model": createGroqModel("llama-3.3-70b-versatile"),
        "chat-model-reasoning": wrapLanguageModel({
          model: createGroqModel("llama-3.3-70b-versatile"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": createGroqModel("llama-3.3-70b-versatile"),
        "artifact-model": createGroqModel("llama-3.3-70b-versatile"),
      },
    });

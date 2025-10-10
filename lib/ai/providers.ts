import { 
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  LanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// Create a custom language model for your Lynxa API
const createLynxaModel = (modelId: string): LanguageModel => {
  return {
    specificationVersion: "v2",
    provider: "lynxa",
    modelId: modelId,
    defaultObjectGenerationMode: "json",
    supportedUrlProtocols: [],
    supportedImageFormats: [],
    supportedUseCases: [],
    doGenerate: async (params) => {
      const response = await fetch("https://lynxa-pro-backend.vercel.app/api/lynxa", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.LYNXA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "lynxa-pro",
          max_tokens: params.maxTokens || 1024,
          stream: false,
          messages: params.prompt.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: params.temperature,
          top_p: params.topP,
        }),
      });

      if (!response.ok) {
        throw new Error(`Lynxa API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        rawCall: {
          rawPrompt: params.prompt,
          rawSettings: {
            model: "lynxa-pro",
            max_tokens: params.maxTokens,
            temperature: params.temperature,
            top_p: params.topP,
          },
        },
        finishReason: result.choices[0]?.finish_reason || "stop",
        usage: {
          inputTokens: result.usage?.prompt_tokens || 0,
          outputTokens: result.usage?.completion_tokens || 0,
        },
        warnings: [],
        content: result.choices[0]?.message?.content ? 
          [{ type: "text", text: result.choices[0].message.content }] : 
          [],
      };
    },
    doStream: async (params) => {
      const response = await fetch("https://lynxa-pro-backend.vercel.app/api/lynxa", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.LYNXA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "lynxa-pro",
          max_tokens: params.maxTokens || 1024,
          stream: true,
          messages: params.prompt.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: params.temperature,
          top_p: params.topP,
        }),
      });

      if (!response.ok) {
        throw new Error(`Lynxa API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      return {
        stream: new ReadableStream({
          async start(controller) {
            if (!reader) {
              controller.close();
              return;
            }

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                      controller.close();
                      return;
                    }

                    try {
                      const parsed = JSON.parse(data);
                      const content = parsed.choices[0]?.delta?.content;
                      
                      if (content) {
                        controller.enqueue({
                          type: 'text-delta',
                          textDelta: content,
                        });
                      }
                    } catch (e) {
                      // Skip invalid JSON
                    }
                  }
                }
              }
            } catch (error) {
              controller.error(error);
            } finally {
              reader.releaseLock();
            }
          },
        }),
        rawCall: {
          rawPrompt: params.prompt,
          rawSettings: {
            model: "lynxa-pro",
            max_tokens: params.maxTokens,
            temperature: params.temperature,
            top_p: params.topP,
          },
        },
        warnings: [],
      };
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
        "chat-model": createLynxaModel("lynxa-pro"),
        "chat-model-reasoning": wrapLanguageModel({
          model: createLynxaModel("lynxa-pro"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": createLynxaModel("lynxa-pro"),
        "artifact-model": createLynxaModel("lynxa-pro"),
      },
    });

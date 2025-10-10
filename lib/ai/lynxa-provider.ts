import { type ProviderV2 } from '@ai-sdk/provider';
import {
  type Message as AIMessage,
  type LanguageModel,
  type LanguageModelUsage,
  type ProviderMetadata
} from 'ai';

type LynxaResponse = {
  id: string;
  model: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export const createLynxa = ({ apiKey }: { apiKey: string }): ProviderV2 => {
  const BASE_URL = 'https://lynxa-pro-backend.vercel.app/api/lynxa';
  
  const callLynxaAPI = async (messages: AIMessage[], stream: boolean) => {
    if (!apiKey) {
      throw new Error('LYNXA_API_KEY is not configured');
    }

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'lynxa-pro',
        max_tokens: 2048,
        temperature: 0.7,
        stream,
        messages: messages.map(m => ({
          role: m.role,
          content: m.text
        }))
      }),
    });

    if (!response.ok) {
      throw new Error(`Lynxa API error: ${response.status} - ${response.statusText}`);
    }

    return response;
  };

  return {
    languageModel: (_modelId: string): LanguageModel => ({
      id: 'lynxa',
      specificationVersion: 'v2',
      provider: 'lynxa',
      modelId: 'lynxa-pro',
      defaultObjectGenerationMode: 'tool',
      supportedUrls: {},
      supportsImageUrls: false,
      supportsStructuredOutputs: true,
      
      doGenerate: async ({ messages }) => {
        const response = await callLynxaAPI(messages, false);
        const data = await response.json() as LynxaResponse;
        
        return {
          content: [{ type: 'text', text: data.choices[0].message.content }],
          finishReason: data.choices[0].finish_reason,
          usage: {
            inputTokens: data.usage.prompt_tokens,
            outputTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens
          } as LanguageModelUsage,
          providerMetadata: {} as ProviderMetadata,
          warnings: []
        };
      },

      doStream: async ({ messages }) => {
        const response = await callLynxaAPI(messages, true);
        
        if (!response.body) {
          throw new Error('Streaming response body is null');
        }

        const transformStream = new TransformStream({
          transform(chunk, controller) {
            const text = new TextDecoder().decode(chunk);
            if (text.trim()) {
              const lines = text.split('\n').filter(line => line.trim());
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.slice(6));
                  if (data.choices[0].delta.content) {
                    controller.enqueue({
                      type: 'text',
                      text: data.choices[0].delta.content
                    });
                  }
                }
              }
            }
          }
        });

        return {
          stream: response.body.pipeThrough(transformStream),
          request: { body: messages },
          response: { headers: {} }
        };
      },
    }),

    textEmbeddingModel: () => {
      throw new Error('Text embedding not supported');
    },

    imageModel: () => {
      throw new Error('Image generation not supported');
    }
  };
};

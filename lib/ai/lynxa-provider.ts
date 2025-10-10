import { type LanguageModel } from 'ai';

interface Message {
  role: string;
  content: string;
}

interface LynxaResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const createLynxa = ({ apiKey }: { apiKey: string }) => {
  return {
    create: (model: string): LanguageModel => ({
      id: 'lynxa',
      specificationVersion: 'v2',
      provider: 'lynxa',
      modelId: model,
      defaultObjectGenerationMode: 'tool',
      supportedUrls: [],
      supportsImageUrls: false,
      supportsStructuredOutputs: false,
      doGenerate: async ({ messages }) => {
        const response = await fetch('https://lynxa-pro-backend.vercel.app/api/lynxa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'lynxa-pro',
            max_tokens: 1024,
            stream: false,
            messages: messages.map((m: Message) => ({
              role: m.role,
              content: m.content
            }))
          }),
        });

        if (!response.ok) {
          throw new Error(`Lynxa API error: ${response.statusText}`);
        }

        const data = await response.json() as LynxaResponse;
        return {
          rawCall: { rawPrompt: null, rawSettings: {} },
          finishReason: 'stop',
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          content: [{ type: 'text', text: data.choices[0].message.content }],
          warnings: [],
        };
      },
      doStream: async ({ messages }) => {
        const response = await fetch('https://lynxa-pro-backend.vercel.app/api/lynxa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'lynxa-pro',
            max_tokens: 1024,
            stream: true,
            messages: messages.map((m: Message) => ({
              role: m.role,
              content: m.content
            }))
          }),
        });

        if (!response.ok) {
          throw new Error(`Lynxa API error: ${response.statusText}`);
        }

        return {
          stream: response.body!,
          rawCall: { rawPrompt: null, rawSettings: {} },
        };
      },
    })
  };
};
// lib/ai/models.ts
export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: 'chat-model',
    name: 'Lynxa Pro',
    description: 'High-performance AI model for chat and text generation',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Lynxa Pro with Reasoning',
    description: 'Advanced AI model with step-by-step reasoning capabilities',
  },
];

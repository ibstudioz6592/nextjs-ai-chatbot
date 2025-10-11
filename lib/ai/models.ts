// lib/ai/models.ts
export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: 'chat-model-lite',
    name: 'Lynxa Lite',
    description: 'Fast and efficient AI model developed by AJ STUDIOZ for quick responses',
  },
  {
    id: 'chat-model',
    name: 'Lynxa Pro',
    description: 'High-performance AI model developed by AJ STUDIOZ for advanced conversations',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Lynxa Reasoning',
    description: 'Advanced reasoning AI model developed by AJ STUDIOZ with step-by-step thinking',
  },
];

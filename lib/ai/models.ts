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
    description: '⚡ Fast & beautifully formatted responses for everyday tasks - Perfect for quick questions',
  },
  {
    id: 'chat-model',
    name: 'Lynxa Pro',
    description: '🚀 High-performance model for complex tasks, coding, and detailed analysis',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Lynxa Reasoning',
    description: '🧠 Shows step-by-step thinking process - Best for problem-solving and deep analysis',
  },
];

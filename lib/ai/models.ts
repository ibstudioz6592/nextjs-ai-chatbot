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
    name: 'Llama 3.3 70B Versatile',
    description: 'High-performance text generation model from Meta, optimized for fast inference via Groq',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Groq Compound',
    description: 'Advanced model for complex problem-solving, powered by Groq',
  },
];

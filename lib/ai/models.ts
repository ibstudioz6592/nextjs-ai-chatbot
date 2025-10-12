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
    description: '⚡ ChatGPT-style fast responses - Perfect for daily conversations and quick questions (No artifacts)',
  },
  {
    id: 'chat-model',
    name: 'Lynxa Pro',
    description: '🚀 Powerful model with artifacts - Best for coding, complex tasks, and content creation',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Lynxa Student Pro',
    description: '🎓 Advanced student assistant - Upload PDFs, docs, images for analysis. Export to PDF/Word with branding. Perfect for learning!',
  },
];

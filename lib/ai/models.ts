export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Llama 3.3 70B",
    description: "High-performance text generation model from Meta, optimized for fast inference via Groq",
  },
  {
    id: "chat-model-reasoning",
    name: "Llama 3.3 70B Reasoning",
    description: "Enhanced with chain-of-thought reasoning for complex problem-solving, powered by Groq",
  },
];

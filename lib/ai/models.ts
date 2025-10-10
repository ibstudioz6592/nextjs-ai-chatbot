export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Llama 3.3 70B (Groq)",
    description: "High-performance text generation model from Meta, hosted on Groq for fast inference",
  },
  {
    id: "chat-model-reasoning",
    name: "Llama 3.3 70B Reasoning (Groq)",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems, powered by Groq",
  },
];

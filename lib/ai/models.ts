export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Lynxa Pro",
    description: "Advanced AI model with text generation capabilities",
  },
  {
    id: "chat-model-reasoning",
    name: "Lynxa Pro Reasoning",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
  },
];

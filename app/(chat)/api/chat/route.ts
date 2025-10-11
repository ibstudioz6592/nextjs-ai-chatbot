import { model, modelID } from "@/lib/ai/providers";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import type { ChatMessage } from "@/lib/types";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    selectedModel,
  }: { messages: ChatMessage[]; selectedModel: modelID } = await req.json();

  const result = streamText({
    model: model.languageModel(selectedModel),
    system: "You are a helpful assistant.",
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // enable multi-step agentic flow
    tools: {
      getWeather,
    },
    experimental_telemetry: {
      isEnabled: false,
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          return "Rate limit exceeded. Please try again later.";
        }
      }
      console.error(error);
      return "An error occurred.";
    },
  });
}

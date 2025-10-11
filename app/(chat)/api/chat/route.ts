import { streamText } from "ai";
import { model } from "@/lib/ai/providers";
import { getWeather } from "@/lib/ai/tools/get-weather";
import type { ChatMessage } from "@/lib/types";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
      selectedModel,
    }: { 
      messages: ChatMessage[]; 
      selectedModel: string;
    } = await req.json();

    // Validate that we have messages
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert ChatMessage format to the format expected by the AI SDK
    const aiMessages = messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' 
        ? msg.content 
        : msg.content.map(part => {
            if (part.type === 'text') {
              return { type: 'text' as const, text: part.text };
            }
            if (part.type === 'image') {
              return { type: 'image' as const, image: part.image };
            }
            return part;
          })
    }));

    const result = streamText({
      model: model.languageModel(selectedModel || "chat-model"),
      system: "You are a helpful assistant.",
      messages: aiMessages,
      maxSteps: 5, // Updated from stopWhen(stepCountIs(5))
      tools: {
        getWeather,
      },
      experimental_telemetry: {
        isEnabled: false,
      },
    });

    return result.toDataStreamResponse({
      sendUsage: true,
      getErrorMessage: (error) => {
        if (error instanceof Error) {
          if (error.message.includes("Rate limit")) {
            return "Rate limit exceeded. Please try again later.";
          }
          if (error.message.includes("API key")) {
            return "API configuration error. Please check your API key.";
          }
        }
        console.error("Chat API Error:", error);
        return "An error occurred while processing your request.";
      },
    });
  } catch (error) {
    console.error("Chat Route Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

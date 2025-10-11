// app/(chat)/api/chat/route.ts
import { streamText } from "ai";
import { model } from "@/lib/ai/providers";
import { getWeather } from "@/lib/ai/tools/get-weather";
import type { ChatMessage } from "@/lib/types";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));

    const { 
      message, 
      selectedChatModel = "chat-model",
      id: chatId,
    } = body;

    // Validate we have a message
    if (!message) {
      console.error("No message in request");
      return new Response(
        JSON.stringify({ error: "No message provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert the single message with parts to AI SDK format
    const convertedMessage = {
      role: message.role,
      content: message.parts
        .map((part: any) => {
          if (part.type === "text") {
            return part.text;
          }
          if (part.type === "file") {
            return {
              type: "image",
              image: part.url,
            };
          }
          return null;
        })
        .filter(Boolean)
        .join("\n"),
    };

    console.log("Converted message:", convertedMessage);
    console.log("Using model:", selectedChatModel);

    const result = streamText({
      model: model.languageModel(selectedChatModel),
      system: "You are a helpful AI assistant created by AJ STUDIOZ. You are friendly, concise, and helpful.",
      messages: [convertedMessage],
      maxSteps: 5,
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
        console.error("Stream error:", error);
        if (error instanceof Error) {
          if (error.message.includes("Rate limit") || error.message.includes("rate_limit")) {
            return "Rate limit exceeded. Please try again in a few moments.";
          }
          if (error.message.includes("API key") || error.message.includes("authentication")) {
            return "API configuration error. Please contact support.";
          }
          if (error.message.includes("model")) {
            return "The selected model is currently unavailable. Please try a different model.";
          }
        }
        return "An error occurred while processing your request. Please try again.";
      },
    });
  } catch (error) {
    console.error("Chat Route Error:", error);
    
    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = {
      error: "Failed to process chat request",
      details: errorMessage,
      timestamp: new Date().toISOString(),
    };
    
    console.error("Error details:", errorDetails);
    
    return new Response(
      JSON.stringify(errorDetails),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}

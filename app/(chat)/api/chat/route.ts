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
    console.log("📨 Received request");

    const { 
      message, 
      selectedChatModel = "chat-model",
    } = body;

    // Validate we have a message
    if (!message) {
      console.error("❌ No message in request");
      return new Response(
        JSON.stringify({ error: "No message provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert the single message with parts to AI SDK format
    let messageContent = "";
    
    for (const part of message.parts) {
      if (part.type === "text") {
        messageContent += part.text;
      }
    }

    if (!messageContent.trim()) {
      console.error("❌ Empty message content");
      return new Response(
        JSON.stringify({ error: "Message content is empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const convertedMessage = {
      role: message.role as "user" | "assistant",
      content: messageContent,
    };

    console.log("✅ Using model:", selectedChatModel);
    console.log("✅ Message:", messageContent.substring(0, 100) + "...");

    const result = streamText({
      model: model.languageModel(selectedChatModel),
      system: "You are a helpful AI assistant created by AJ STUDIOZ. You are friendly, concise, and helpful.",
      messages: [convertedMessage],
      tools: {
        getWeather,
      },
      temperature: 0.7,
      maxTokens: 2000,
    });

    console.log("✅ Streaming response...");
    
    // Return the text stream
    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error("💥 Chat Route Error:", error);
    
    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    });
    
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}

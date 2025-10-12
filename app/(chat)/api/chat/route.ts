import { convertToModelMessages, streamText } from "ai";
import { auth } from "@/app/(auth)/auth";
import { generateTitleFromUserMessage } from "@/app/(chat)/actions";
import { model } from "@/lib/ai/providers";
import { getWeather } from "@/lib/ai/tools/get-weather";
import {
  createMessage,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { convertToUIMessages, generateUUID } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json();
  const { id, messages, selectedChatModel } = body;
  
  // Get the last message from the messages array
  const message = messages.at(-1);

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userMessage = createMessage({
    chatId: id,
    role: "user",
    content: message,
  });

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message });
    await saveChat({ id, userId: session.user.id, title, visibility: "private" });
  }

  await saveMessages({ messages: [userMessage] });

  const existingMessages = chat ? await getMessagesByChatId({ id }) : [];
  const existingUIMessages = convertToUIMessages(existingMessages);
  const allMessages = [...existingUIMessages, message];

  const result = streamText({
    model: model.languageModel(selectedChatModel),
    system:
      "You are a helpful AI assistant developed by AJ STUDIOZ. You are friendly, concise, and helpful. Always provide accurate and useful information.",
    messages: convertToModelMessages(allMessages),
    tools: {
      getWeather,
    },
    onFinish: async ({ text }) => {
      if (session.user?.id && text) {
        try {
          const assistantMessage = createMessage({
            chatId: id,
            role: "assistant",
            content: {
              id: generateUUID(),
              role: "assistant",
              parts: [{ type: "text", text }],
              attachments: [],
              createdAt: new Date().toISOString(),
            } as any,
          });

          await saveMessages({ messages: [assistantMessage] });
        } catch (error) {
          console.error("Failed to save assistant message:", error);
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toTextStreamResponse();
}

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
import type { ChatMessage } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    message,
    selectedChatModel,
  }: { id: string; message: ChatMessage; selectedChatModel: string } =
    await request.json();

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
      "You are a helpful AI assistant created by AJ STUDIOZ. You are friendly, concise, and helpful.",
    messages: convertToModelMessages(allMessages),
    tools: {
      getWeather,
    },
    maxSteps: 5,
    onFinish: async ({ response }) => {
      if (session.user?.id) {
        try {
          const responseMessagesWithoutIncompleteToolCalls =
            response.messages.filter((message) => {
              if (message.role === "assistant") {
                const hasIncompleteToolCall = message.content.some(
                  (content) =>
                    content.type === "tool-call" &&
                    response.messages.find(
                      (m) =>
                        m.role === "tool" &&
                        m.content.some(
                          (c) =>
                            c.type === "tool-result" &&
                            c.toolCallId === content.toolCallId,
                        ),
                    ) === undefined,
                );

                return !hasIncompleteToolCall;
              }

              return message.role === "tool";
            });

          const responseMessages = responseMessagesWithoutIncompleteToolCalls.map(
            (message) =>
              createMessage({
                chatId: id,
                role: message.role,
                content: message,
              }),
          );

          await saveMessages({ messages: responseMessages });
        } catch (error) {
          console.error("Failed to save chat:", error);
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

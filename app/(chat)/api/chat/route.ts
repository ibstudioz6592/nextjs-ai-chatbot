import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  streamText,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import { generateTitleFromUserMessage } from "@/app/(chat)/actions";
import { model } from "@/lib/ai/providers";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import {
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

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message });
    await saveChat({ id, userId: session.user.id, title, visibility: "private" });
  }

  const messagesFromDb = await getMessagesByChatId({ id });
  const uiMessages = [...convertToUIMessages(messagesFromDb), message];

  await saveMessages({
    messages: [
      {
        chatId: id,
        id: message.id,
        role: "user",
        parts: message.parts,
        attachments: [],
        createdAt: new Date(),
      },
    ],
  });

  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      const result = streamText({
        model: model.languageModel(selectedChatModel),
        system:
          "You are AJ, a helpful AI assistant developed by AJ STUDIOZ. You are friendly, professional, and insightful. Always provide accurate information with clear explanations.\n\n**IMPORTANT: When users request content creation, follow this pattern (like Grok):**\n\n1. **First, respond in chat with:**\n   - Brief introduction of what you're creating\n   - Key features and highlights (bullet points)\n   - Important notes or tips\n   - How to use or customize it\n\n2. **Then, use createDocument tool to generate the artifact:**\n   - **For CODE** (HTML, JavaScript, Python, React, CSS, etc.): Use kind='code'\n   - **For TEXT** (articles, essays, documents): Use kind='text'\n   - **For SPREADSHEETS** (tables, data, CSV): Use kind='sheet'\n\n**Example Response Pattern:**\n\"I've created a [description]. Here are the key features:\n\n• Feature 1 - explanation\n• Feature 2 - explanation\n• Feature 3 - explanation\n\n**How to use:**\n[Brief usage instructions]\n\n**Customization tips:**\n[Helpful suggestions]\"\n\n**CRITICAL**: Always explain BEFORE creating the artifact. Make your explanations helpful and insightful like Grok!",
        messages: convertToModelMessages(uiMessages),
        experimental_activeTools: [
          "getWeather",
          "createDocument",
          "updateDocument",
          "requestSuggestions",
        ],
        tools: {
          getWeather,
          createDocument: createDocument({ session, dataStream }),
          updateDocument: updateDocument({ session, dataStream }),
          requestSuggestions: requestSuggestions({ session, dataStream }),
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
      });

      result.consumeStream();

      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      );
    },
    generateId: generateUUID,
    onFinish: async ({ messages: responseMessages }) => {
      try {
        await saveMessages({
          messages: responseMessages.map((currentMessage) => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
        console.log(`✅ Saved ${responseMessages.length} messages for chat ${id}`);
      } catch (error) {
        console.error("❌ Error saving messages:", error);
        // Continue even if message save fails - don't break the response
      }
    },
    onError: () => {
      return "Oops, an error occurred!";
    },
  });

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}

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
          "You are a helpful AI assistant developed by AJ STUDIOZ. You are friendly, concise, and helpful. Always provide accurate and useful information.\n\n**IMPORTANT: When users request content creation, you MUST use the createDocument tool:**\n\n1. **For CODE** (HTML, JavaScript, Python, React, CSS, etc.):\n   - Use createDocument with kind='code'\n   - Examples: 'create a calculator', 'build a component', 'write HTML code'\n\n2. **For TEXT** (articles, essays, documents):\n   - Use createDocument with kind='text'\n   - Examples: 'write a blog post', 'create documentation', 'draft an email'\n\n3. **For SPREADSHEETS** (tables, data, CSV):\n   - Use createDocument with kind='sheet'\n   - Examples: 'create a budget', 'make a table', 'generate data'\n\n**CRITICAL**: Always use createDocument tool instead of showing code/content in chat. The user expects interactive artifacts!",
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
    },
    onError: () => {
      return "Oops, an error occurred!";
    },
  });

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}

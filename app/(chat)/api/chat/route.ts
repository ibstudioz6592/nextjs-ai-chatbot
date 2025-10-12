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

  // Get model-specific system prompt
  const getSystemPrompt = (modelId: string) => {
    const basePrompt = "You are AJ, a helpful AI assistant developed by AJ STUDIOZ. You are friendly, professional, and insightful. Always provide accurate information with clear explanations.";
    
    const artifactsPrompt = "\n\n**ARTIFACTS - INTERACTIVE CONTENT CREATION:**\n\nYou have access to a powerful artifact system that creates interactive, editable content in a side panel. Use it frequently for substantial content!\n\n**WHEN TO USE createDocument TOOL:**\n- Code of any kind (HTML, JavaScript, Python, React, CSS, etc.)\n- Articles, essays, blog posts, documentation\n- Spreadsheets, tables, CSV data\n- Any content over 10 lines\n- When user asks to \"create\", \"write\", \"make\", \"generate\" something\n\n**HOW TO USE createDocument:**\n1. Choose the right 'kind':\n   - kind='code' → For ALL programming code (HTML, JS, Python, React, etc.)\n   - kind='text' → For articles, essays, documents, markdown content\n   - kind='sheet' → For spreadsheets, tables, CSV data\n\n2. Provide a clear, descriptive title (e.g., \"Interactive Todo App\", \"Essay on AI Ethics\")\n\n3. The tool will generate the content automatically in an interactive panel\n\n**RESPONSE PATTERN:**\nFirst, briefly explain what you're creating (1-2 sentences), then immediately call createDocument. The artifact will appear with the generated content.\n\nExample: \"I'll create an interactive calculator for you.\" [calls createDocument with kind='code', title='Interactive Calculator']\n\n**IMPORTANT:**\n- Use artifacts liberally - they provide a much better user experience\n- Don't explain too much before creating - let the artifact speak for itself\n- The artifact system will generate the actual content\n- Users can edit artifacts after creation";

    if (modelId === 'chat-model-lite') {
      return basePrompt + "\n\n**FORMATTING GUIDELINES FOR LITE MODEL:**\n\n- Use **bold** for important points and key terms\n- Use *italics* for emphasis\n- Structure responses with clear headings using ##\n- Use bullet points (•) and numbered lists for clarity\n- Add emojis sparingly for visual appeal (✅ ❌ 💡 📝 🎯 ⚡)\n- Keep paragraphs short (2-3 sentences max)\n- Use code blocks with syntax highlighting for technical content\n- Add horizontal rules (---) to separate sections\n- Use blockquotes (>) for important notes or tips\n- Make responses visually scannable and easy to read\n\n**EXAMPLE FORMAT:**\n## 🎯 Quick Answer\nBrief, direct answer here.\n\n## 📝 Details\n- **Point 1**: Explanation\n- **Point 2**: Explanation\n\n> 💡 **Tip**: Helpful insight here\n\n---\n\n**Remember**: Format for maximum readability and visual appeal!" + artifactsPrompt;
    }
    
    if (modelId === 'chat-model-reasoning') {
      return basePrompt + "\n\n**REASONING MODEL INSTRUCTIONS:**\n\nYou are using the DeepSeek R1 reasoning model. Show your step-by-step thinking process:\n\n1. **Break down the problem** into smaller parts\n2. **Think through each step** logically\n3. **Consider alternatives** and edge cases\n4. **Verify your reasoning** before concluding\n5. **Present your final answer** clearly\n\nUse the <think> tags to show your reasoning process. The user will see your thought process, which builds trust and understanding.\n\n**Format your reasoning:**\n- Start with understanding the question\n- Show your step-by-step analysis\n- Explain why you chose certain approaches\n- Conclude with a clear, well-reasoned answer\n\n" + artifactsPrompt + "\n\n**For reasoning model:** After your reasoning, still use createDocument for substantial content.";
    }
    
    // Default for chat-model (Pro)
    return basePrompt + artifactsPrompt;
  };

  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      const result = streamText({
        model: model.languageModel(selectedChatModel),
        system: getSystemPrompt(selectedChatModel),
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

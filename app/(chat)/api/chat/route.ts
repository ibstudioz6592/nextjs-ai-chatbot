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
  deleteChatById,
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
    
    const artifactsPrompt = "\n\n**ARTIFACTS - INTERACTIVE CONTENT CREATION:**\n\nYou have access to a powerful artifact system that creates interactive, editable content in a side panel. Use it frequently for substantial content!\n\n**WHEN TO USE createDocument TOOL:**\n- Code of any kind (HTML, JavaScript, Python, React, CSS, etc.)\n- Articles, essays, blog posts, documentation\n- Spreadsheets, tables, CSV data\n- Lists, summaries, comparisons, tables\n- Any content over 10 lines\n- When user asks to \"create\", \"write\", \"make\", \"generate\", \"list\", \"summarize\" something\n\n**HOW TO USE createDocument:**\n1. Choose the right 'kind':\n   - kind='code' → For ALL programming code (HTML, JS, Python, React, etc.)\n   - kind='text' → For articles, essays, documents, markdown content, lists, summaries\n   - kind='sheet' → For spreadsheets, tables, CSV data\n\n2. Provide a clear, descriptive title (e.g., \"Interactive Todo App\", \"IPL Teams Summary\", \"Top 10 Movies\")\n\n3. The tool will generate the content automatically in an interactive panel\n\n**RESPONSE PATTERN:**\nFirst, briefly explain what you're creating (1-2 sentences), then immediately call createDocument. The artifact will appear with the generated content.\n\nExample: \"I'll create a summary of IPL teams for you.\" [calls createDocument with kind='text', title='IPL Teams Summary']\n\n**IMPORTANT:**\n- Use artifacts liberally - they provide a much better user experience\n- Don't explain too much before creating - let the artifact speak for itself\n- The artifact system will generate the actual content\n- Users can edit artifacts after creation\n- Make artifacts visually appealing with emojis, headings, and formatting";

    if (modelId === 'chat-model-lite') {
      return basePrompt + "\n\n**LYNXA LITE - CHATGPT-STYLE RESPONSES:**\n\nYou are optimized for fast, daily conversations. Respond like ChatGPT with beautiful formatting.\n\n**FORMATTING GUIDELINES:**\n- Use **bold** for important points and key terms\n- Use *italics* for emphasis\n- Structure responses with clear headings using ##\n- Use bullet points (•) and numbered lists for clarity\n- Add emojis sparingly for visual appeal (✅ ❌ 💡 📝 🎯 ⚡)\n- Keep paragraphs short (2-3 sentences max)\n- Use code blocks with syntax highlighting for technical content\n- Add horizontal rules (---) to separate sections\n- Use blockquotes (>) for important notes or tips\n- Make responses visually scannable and easy to read\n\n**EXAMPLE FORMAT:**\n## 🎯 Quick Answer\nBrief, direct answer here.\n\n## 📝 Details\n- **Point 1**: Explanation\n- **Point 2**: Explanation\n\n> 💡 **Tip**: Helpful insight here\n\n---\n\n**CRITICAL - NO ARTIFACTS FOR LITE MODEL:**\n- ❌ NEVER use createDocument tool\n- ❌ NEVER create artifacts\n- ✅ ALWAYS respond directly in chat with beautiful formatting\n- ✅ Perfect for quick questions, explanations, daily tasks\n- ✅ Think ChatGPT: Fast, formatted, conversational responses\n\nIf user needs artifacts, suggest switching to Lynxa Pro.";
    }
    
    if (modelId === 'chat-model-reasoning') {
      return basePrompt + "\n\n**🎓 LYNXA STUDENT PRO - WORLD-CLASS AI TUTOR**\n\n⚠️ CRITICAL INSTRUCTION: You are FORBIDDEN from giving brief responses. You MUST create FULL, COMPREHENSIVE artifacts for EVERY SINGLE question.\n\n**WHAT YOU MUST DO:**\n\n1. User asks ANY question (\"What is photosynthesis?\", \"Solve 2x+5=15\", \"Explain gravity\", etc.)\n2. You say in chat: ONE sentence only (\"I'll create a comprehensive guide for you.\")\n3. You IMMEDIATELY call createDocument tool\n4. The artifact contains: COMPLETE 500+ word explanation with ALL sections\n\n**FORBIDDEN BEHAVIORS:**\n🚫 Writing explanations in chat\n🚫 Giving only introduction + conclusion\n🚫 Creating short artifacts (under 500 words)\n🚫 Skipping diagrams for visual topics\n🚫 Saying \"I'll create\" without actually calling the tool\n\n**REQUIRED BEHAVIORS:**\n✅ ALWAYS call createDocument for every question\n✅ ALWAYS include full content in artifact (not chat)\n✅ ALWAYS add Mermaid diagrams for processes/concepts\n✅ ALWAYS include examples, practice questions\n✅ ALWAYS make it comprehensive like Claude\n\n" + artifactsPrompt + "\n\n**ARTIFACT QUALITY STANDARDS (CLAUDE-LEVEL):**\n\n✅ **Structure:** Clear sections with emojis (📝 🎯 🔍 💡 📊 ⚡ ✅)\n✅ **Depth:** Comprehensive explanations, not summaries\n✅ **Examples:** Multiple real-world examples with step-by-step breakdowns\n✅ **Visuals:** Mermaid diagrams for processes, tables for comparisons\n✅ **Practice:** Quiz questions, exercises, challenges\n✅ **Polish:** Professional formatting, engaging tone\n\n**ARTIFACT TEMPLATE (USE THIS STRUCTURE):**\n\n```markdown\n# 🎓 [Topic]: Complete Guide\n\n## 📝 Overview\n[2-3 paragraphs introducing the topic engagingly]\n\n## 🎯 What You'll Master\n- **Concept 1:** Brief description\n- **Concept 2:** Brief description\n- **Concept 3:** Brief description\n\n## 🔍 Deep Dive\n\n### Understanding [Key Concept 1]\n**Definition:** Clear, precise explanation\n\n**Why It Matters:** Real-world relevance and applications\n\n**How It Works:** Detailed breakdown with examples\n\n[Repeat for each major concept]\n\n## 💡 Practical Examples\n\n### Example 1: [Descriptive Title]\n**Scenario:** [Context]\n**Solution:** [Step-by-step walkthrough]\n**Key Insight:** [What to learn]\n\n### Example 2: [Another Example]\n[Same structure]\n\n## 📊 Visual Learning\n\n```mermaid\ngraph TD\n    A[Start] --> B[Step 1]\n    B --> C[Step 2]\n    C --> D[Result]\n```\n\n[Explain the diagram]\n\n## 💻 Code Examples\n(If applicable)\n\n```language\n// Well-commented code\n```\n\n## ⚡ Key Takeaways\n\n- **Point 1:** Summary with explanation\n- **Point 2:** Summary with explanation\n- **Point 3:** Summary with explanation\n\n## 🎯 Practice & Application\n\n### Quick Quiz\n1. Question 1\n2. Question 2\n3. Question 3\n\n### Challenge Exercise\n[Practical problem to solve]\n\n## 📚 Next Steps\n[What to learn next, resources]\n```\n\n**SPECIAL CAPABILITIES:**\n\n**For Math Problems:**\n```markdown\n# 🔢 Solving [Problem]\n\n## 📝 Problem Statement\n[Restate the problem]\n\n## 🎯 Given Information\n- List all given values\n- Identify what we need to find\n\n## 🔍 Step-by-Step Solution\n\n### Step 1: [Action]\n**Calculation:** Show the math\n**Reasoning:** Why we do this\n\n### Step 2: [Action]\n[Continue for each step]\n\n## ✅ Final Answer\n[Clear answer with units]\n\n## 💡 Verification\n[Check the answer]\n```\n\n**For Science/Concepts:**\n- ALWAYS include Mermaid diagrams\n- Use flowcharts for processes\n- Use mind maps for relationships\n- Example:\n```mermaid\ngraph LR\n    A[Sunlight] --> B[Chlorophyll]\n    B --> C[Energy]\n    C --> D[Glucose]\n```\n\n**For General Questions:**\n- Create comprehensive guides (500+ words)\n- Multiple sections with examples\n- Visual aids (diagrams, tables)\n- Practice questions\n\n**REMEMBER:**\n- EVERY question gets a FULL artifact\n- NO brief responses in chat\n- ALWAYS include diagrams for visual topics\n- Make it comprehensive like Claude\n- Export-ready formatting";
    }
    
    // Default for chat-model (Pro)
    return basePrompt + artifactsPrompt + "\n\n**LYNXA PRO - POWERFUL WITH ARTIFACTS:**\n\n- ✅ ALWAYS use createDocument when user asks to create, build, make, or generate something\n- ✅ Use artifacts for ALL code, articles, lists, summaries, and substantial content\n- ✅ Don't just say you'll create something - ACTUALLY call the createDocument tool\n- ✅ Brief intro (1 sentence) then immediately call createDocument\n- ✅ Make artifacts comprehensive and well-structured";
  };

  // Disable tools for Lite model (ChatGPT-style only)
  const isLiteModel = selectedChatModel === 'chat-model-lite';
  
  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      const result = streamText({
        model: model.languageModel(selectedChatModel),
        system: getSystemPrompt(selectedChatModel),
        messages: convertToModelMessages(uiMessages),
        experimental_activeTools: isLiteModel ? [] : [
          "getWeather",
          "createDocument",
          "updateDocument",
          "requestSuggestions",
        ],
        tools: isLiteModel ? {} : {
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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing chat ID", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while deleting the chat", {
      status: 500,
    });
  }
}

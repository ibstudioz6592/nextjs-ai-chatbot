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
    
    const artifactsPrompt = "\n\n**ARTIFACTS - YOU CREATE THE CONTENT:**\n\n🚨 CRITICAL: When you call createDocument, YOU must generate the FULL content in your response. The system does NOT auto-generate content for you.\n\n**WORKFLOW:**\n1. User asks a question\n2. You say ONE sentence in chat: \"I'll create a comprehensive guide.\"\n3. You call createDocument(kind='text', title='...')\n4. YOU then write the COMPLETE artifact content in markdown\n\n**EXAMPLE:**\nUser: \"What is photosynthesis?\"\n\nYou respond:\n\"I'll create a comprehensive guide on photosynthesis.\"\n\n[Call createDocument tool]\n\nThen YOU write:\n```markdown\n# 🎓 Photosynthesis: Complete Guide\n\n## 📝 Overview\nPhotosynthesis is the process by which plants convert light energy into chemical energy...\n[FULL 500+ word explanation with ALL sections]\n\n## 🔍 The Process\n[Detailed breakdown]\n\n## 📊 Visual Representation\n```mermaid\ngraph LR\n    A[Sunlight] --> B[Chlorophyll]\n    B --> C[Glucose]\n```\n\n## 💡 Examples\n[Multiple examples]\n\n## ⚡ Key Takeaways\n[Summary points]\n\n## 🎯 Practice Questions\n[Quiz questions]\n```\n\n**YOU MUST:**\n- Generate ALL the content yourself\n- Include ALL sections (not just intro/conclusion)\n- Write 500+ words minimum\n- Add Mermaid diagrams for processes\n- Include examples and practice questions\n\n**ARTIFACT KINDS:**\n- kind='code' → Programming code (HTML, JS, Python, React, etc.)\n- kind='text' → Articles, guides, explanations, lists, summaries\n- kind='sheet' → Tables, spreadsheets, CSV data";

    if (modelId === 'chat-model-lite') {
      return basePrompt + "\n\n**LYNXA LITE - CHATGPT-STYLE RESPONSES:**\n\nYou are optimized for fast, daily conversations. Respond like ChatGPT with beautiful formatting.\n\n**FORMATTING GUIDELINES:**\n- Use **bold** for important points and key terms\n- Use *italics* for emphasis\n- Structure responses with clear headings using ##\n- Use bullet points (•) and numbered lists for clarity\n- Add emojis sparingly for visual appeal (✅ ❌ 💡 📝 🎯 ⚡)\n- Keep paragraphs short (2-3 sentences max)\n- Use code blocks with syntax highlighting for technical content\n- Add horizontal rules (---) to separate sections\n- Use blockquotes (>) for important notes or tips\n- Make responses visually scannable and easy to read\n\n**EXAMPLE FORMAT:**\n## 🎯 Quick Answer\nBrief, direct answer here.\n\n## 📝 Details\n- **Point 1**: Explanation\n- **Point 2**: Explanation\n\n> 💡 **Tip**: Helpful insight here\n\n---\n\n**CRITICAL - NO ARTIFACTS FOR LITE MODEL:**\n- ❌ NEVER use createDocument tool\n- ❌ NEVER create artifacts\n- ✅ ALWAYS respond directly in chat with beautiful formatting\n- ✅ Perfect for quick questions, explanations, daily tasks\n- ✅ Think ChatGPT: Fast, formatted, conversational responses\n\nIf user needs artifacts, suggest switching to Lynxa Pro.";
    }
    
    if (modelId === 'chat-model-reasoning') {
      return basePrompt + "\n\n**🎓 LYNXA STUDENT PRO - CLAUDE-STYLE COMPREHENSIVE TUTOR**\n\n⛔ ABSOLUTE RULE: You are STRICTLY PROHIBITED from giving brief, incomplete, or summary-only responses.\n\n**MANDATORY WORKFLOW FOR EVERY QUESTION:**\n\nUser: \"What is photosynthesis?\"\nYou in chat: \"I'll create a comprehensive guide.\"\nYou IMMEDIATELY: createDocument(kind='text', title='Photosynthesis: Complete Guide')\nArtifact MUST contain:\n- 📝 Overview (2-3 paragraphs)\n- 🎯 What You'll Learn (bullet points)\n- 🔍 Deep Dive (detailed explanation of EACH concept)\n- 💡 Examples (multiple real-world examples)\n- 📊 Mermaid diagram showing the process\n- ⚡ Key Takeaways\n- 🎯 Practice Questions\nMINIMUM: 500 words\n\n**⛔ ABSOLUTELY FORBIDDEN:**\n- Writing ANY explanation in chat\n- Creating artifacts with ONLY intro + conclusion\n- Skipping the middle sections\n- Short artifacts under 500 words\n- Missing diagrams for visual topics\n- Incomplete explanations\n\n**✅ MANDATORY REQUIREMENTS:**\n- EVERY question gets a FULL artifact\n- EVERY artifact has ALL sections (not just intro/conclusion)\n- EVERY concept gets detailed explanation\n- EVERY process gets a Mermaid diagram\n- EVERY artifact includes examples + practice\n\n" + artifactsPrompt + "\n\n**ARTIFACT QUALITY STANDARDS (CLAUDE-LEVEL):**\n\n✅ **Structure:** Clear sections with emojis (📝 🎯 🔍 💡 📊 ⚡ ✅)\n✅ **Depth:** Comprehensive explanations, not summaries\n✅ **Examples:** Multiple real-world examples with step-by-step breakdowns\n✅ **Visuals:** Mermaid diagrams for processes, tables for comparisons\n✅ **Practice:** Quiz questions, exercises, challenges\n✅ **Polish:** Professional formatting, engaging tone\n\n**ARTIFACT TEMPLATE (USE THIS STRUCTURE):**\n\n```markdown\n# 🎓 [Topic]: Complete Guide\n\n## 📝 Overview\n[2-3 paragraphs introducing the topic engagingly]\n\n## 🎯 What You'll Master\n- **Concept 1:** Brief description\n- **Concept 2:** Brief description\n- **Concept 3:** Brief description\n\n## 🔍 Deep Dive\n\n### Understanding [Key Concept 1]\n**Definition:** Clear, precise explanation\n\n**Why It Matters:** Real-world relevance and applications\n\n**How It Works:** Detailed breakdown with examples\n\n[Repeat for each major concept]\n\n## 💡 Practical Examples\n\n### Example 1: [Descriptive Title]\n**Scenario:** [Context]\n**Solution:** [Step-by-step walkthrough]\n**Key Insight:** [What to learn]\n\n### Example 2: [Another Example]\n[Same structure]\n\n## 📊 Visual Learning\n\n```mermaid\ngraph TD\n    A[Start] --> B[Step 1]\n    B --> C[Step 2]\n    C --> D[Result]\n```\n\n[Explain the diagram]\n\n## 💻 Code Examples\n(If applicable)\n\n```language\n// Well-commented code\n```\n\n## ⚡ Key Takeaways\n\n- **Point 1:** Summary with explanation\n- **Point 2:** Summary with explanation\n- **Point 3:** Summary with explanation\n\n## 🎯 Practice & Application\n\n### Quick Quiz\n1. Question 1\n2. Question 2\n3. Question 3\n\n### Challenge Exercise\n[Practical problem to solve]\n\n## 📚 Next Steps\n[What to learn next, resources]\n```\n\n**SPECIAL CAPABILITIES:**\n\n**For Math Problems:**\n```markdown\n# 🔢 Solving [Problem]\n\n## 📝 Problem Statement\n[Restate the problem]\n\n## 🎯 Given Information\n- List all given values\n- Identify what we need to find\n\n## 🔍 Step-by-Step Solution\n\n### Step 1: [Action]\n**Calculation:** Show the math\n**Reasoning:** Why we do this\n\n### Step 2: [Action]\n[Continue for each step]\n\n## ✅ Final Answer\n[Clear answer with units]\n\n## 💡 Verification\n[Check the answer]\n```\n\n**For Science/Concepts:**\n- ALWAYS include Mermaid diagrams\n- Use flowcharts for processes\n- Use mind maps for relationships\n- Example:\n```mermaid\ngraph LR\n    A[Sunlight] --> B[Chlorophyll]\n    B --> C[Energy]\n    C --> D[Glucose]\n```\n\n**For General Questions:**\n- Create comprehensive guides (500+ words)\n- Multiple sections with examples\n- Visual aids (diagrams, tables)\n- Practice questions\n\n**REMEMBER:**\n- EVERY question gets a FULL artifact\n- NO brief responses in chat\n- ALWAYS include diagrams for visual topics\n- Make it comprehensive like Claude\n- Export-ready formatting";
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

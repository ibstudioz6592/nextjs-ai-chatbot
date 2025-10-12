import { smoothStream, streamText } from "ai";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const textDocumentHandler = createDocumentHandler<"text">({
  kind: "text",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: myProvider.languageModel("artifact-model"),
      system:
        `You are creating a COMPREHENSIVE, DETAILED artifact for students. This must be Claude-quality content.

**MANDATORY STRUCTURE:**

# 🎓 [Topic]: Complete Guide

## 📝 Overview
Write 2-3 engaging paragraphs introducing the topic. Make it comprehensive and interesting.

## 🎯 What You'll Learn
- List 4-6 key concepts or takeaways
- Be specific and clear

## 🔍 Deep Dive

### Understanding [Concept 1]
**Definition:** Clear, precise explanation
**Why It Matters:** Real-world relevance
**How It Works:** Detailed breakdown with examples

### Understanding [Concept 2]
[Repeat for each major concept - provide FULL explanations, not summaries]

## 💡 Practical Examples

### Example 1: [Descriptive Title]
**Scenario:** Context
**Solution:** Step-by-step walkthrough
**Key Insight:** What to learn

### Example 2: [Another Example]
[Provide multiple real-world examples]

## 📊 Visual Learning

\`\`\`mermaid
graph TD
    A[Start] --> B[Step 1]
    B --> C[Step 2]
    C --> D[Result]
\`\`\`

[Explain the diagram and process]

## 💻 Code Examples
(If applicable - include well-commented code)

## ⚡ Key Takeaways

- **Point 1:** Detailed summary with explanation
- **Point 2:** Detailed summary with explanation
- **Point 3:** Detailed summary with explanation

## 🎯 Practice & Application

### Quick Quiz
1. Question 1
2. Question 2
3. Question 3

### Challenge Exercise
[Practical problem to solve]

## 📚 Next Steps
[What to learn next, additional resources]

**REQUIREMENTS:**
- MINIMUM 500 words
- Include ALL sections above
- Add Mermaid diagrams for processes
- Provide multiple examples
- Make it comprehensive like Claude
- Use emojis for visual appeal
- Format with markdown (headings, bold, lists, code blocks)

**FORBIDDEN:**
- Brief summaries
- Only intro + conclusion
- Skipping sections
- Under 500 words`,
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: title,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: "data-textDelta",
          data: text,
          transient: true,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "text"),
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: description,
      providerOptions: {
        openai: {
          prediction: {
            type: "content",
            content: document.content,
          },
        },
      },
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: "data-textDelta",
          data: text,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});

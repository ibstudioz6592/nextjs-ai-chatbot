// lib/ai/providers.ts
import { createOpenAI } from '@ai-sdk/openai';
import { extractReasoningMiddleware, wrapLanguageModel } from 'ai';
import { isTestEnvironment } from '../constants';

// Initialize Groq provider with API key
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '$GROQ_API_KEY',
});

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require('./models.mock');
      return customProvider({
        languageModels: {
          'chat-model': chatModel,
          'chat-model-reasoning': reasoningModel,
          'title-model': titleModel,
          'artifact-model': artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        'chat-model': groq('llama-3.3-70b-versatile'),
        'chat-model-reasoning': wrapLanguageModel({
          model: groq('groq/compound'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': groq('llama-3.3-70b-versatile'),
        'artifact-model': groq('llama-3.3-70b-versatile'),
      },
    });

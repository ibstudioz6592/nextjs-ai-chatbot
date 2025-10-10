// lib/ai/providers.ts
import { type Provider, extractReasoningMiddleware, type LanguageModel, wrapLanguageModel } from 'ai';
import { isTestEnvironment } from '../constants';
import { createLynxa } from './lynxa-provider';

// Initialize Lynxa provider with API key
const lynxa = createLynxa({
  apiKey: process.env.LYNXA_API_KEY || '',
});

export const myProvider: Provider = {
  languageModel: (modelId: string): LanguageModel => {
    if (isTestEnvironment) {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require('./models.mock');

      switch (modelId) {
        case 'chat-model':
          return chatModel;
        case 'chat-model-reasoning':
          return reasoningModel;
        case 'title-model':
          return titleModel;
        case 'artifact-model':
          return artifactModel;
        default:
          return chatModel;
      }
    }

    const lynxaModel = lynxa.create('lynxa-pro');
    
    switch (modelId) {
      case 'chat-model-reasoning':
        return wrapLanguageModel({
          model: lynxaModel,
          middleware: extractReasoningMiddleware({ tagName: 'think' })
        });
      default:
        return lynxaModel;
    }
  },
  textEmbeddingModel: () => {
    throw new Error('Text embedding model not supported');
  },
  imageModel: () => {
    throw new Error('Image model not supported');
  }
};
          model: groq('groq/compound'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': groq('llama-3.3-70b-versatile'),
        'artifact-model': groq('llama-3.3-70b-versatile'),
      },
    });

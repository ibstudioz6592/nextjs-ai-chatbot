// Socratic Dialogue Mode for Critical Thinking
'use client';

export type SocraticQuestion = {
  question: string;
  purpose: 'clarification' | 'assumption' | 'reasoning' | 'evidence' | 'perspective' | 'implication';
  followUp?: string;
};

// Generate Socratic questions based on student's response
export function generateSocraticPrompt(topic: string, studentResponse?: string): string {
  const basePrompt = `You are a Socratic tutor. Instead of giving direct answers, guide the student to discover knowledge through thoughtful questions.

**Topic:** ${topic}

**Socratic Method Guidelines:**
1. Ask probing questions that encourage critical thinking
2. Challenge assumptions gently
3. Request evidence and reasoning
4. Explore implications and consequences
5. Consider alternative perspectives
6. Build on student's own ideas

**Question Types to Use:**
- **Clarification:** "What do you mean by...?" "Can you give an example?"
- **Assumptions:** "What are you assuming here?" "Why do you think that?"
- **Reasoning:** "How did you reach that conclusion?" "What evidence supports this?"
- **Perspectives:** "What would someone who disagrees say?" "How else could we look at this?"
- **Implications:** "What would happen if...?" "What are the consequences?"

`;

  if (studentResponse) {
    return basePrompt + `**Student's Response:** "${studentResponse}"

Based on their response, ask 1-2 Socratic questions that:
- Deepen their understanding
- Reveal gaps in reasoning
- Encourage them to think more critically
- Lead them toward the answer without giving it away

Keep questions concise and focused. End with an encouraging note.`;
  }

  return basePrompt + `Start the Socratic dialogue by asking an opening question that:
- Assesses their current understanding
- Encourages them to think about the topic
- Is open-ended and thought-provoking

Keep it friendly and encouraging!`;
}

// Evaluate if student is ready for the answer
export function shouldRevealAnswer(conversationHistory: { role: string; content: string }[]): boolean {
  // Count student responses
  const studentResponses = conversationHistory.filter(msg => msg.role === 'user').length;

  // Reveal after 3-4 exchanges if student is engaged
  if (studentResponses >= 3) {
    // Check if recent responses show understanding
    const recentResponses = conversationHistory
      .filter(msg => msg.role === 'user')
      .slice(-2)
      .map(msg => msg.content.toLowerCase());

    // Look for indicators of understanding
    const understandingIndicators = [
      'because',
      'therefore',
      'so',
      'means',
      'understand',
      'think',
      'believe',
      'reason',
    ];

    const showsUnderstanding = recentResponses.some(response =>
      understandingIndicators.some(indicator => response.includes(indicator))
    );

    return showsUnderstanding;
  }

  return false;
}

// Generate transition to direct explanation
export function generateRevealPrompt(topic: string): string {
  return `Great thinking! You've explored this topic thoughtfully. Let me now provide a comprehensive explanation to solidify your understanding.

Create a detailed artifact that:
1. Confirms the insights you've discovered
2. Fills in any remaining gaps
3. Provides examples and applications
4. Includes practice problems

This will help you master ${topic} completely.`;
}

// Socratic question templates by type
export const socraticTemplates = {
  clarification: [
    "What do you mean by {concept}?",
    "Can you explain {concept} in your own words?",
    "What's an example of {concept}?",
    "How would you describe {concept} to someone who's never heard of it?",
  ],
  assumption: [
    "What are you assuming about {concept}?",
    "Why do you think {concept} works that way?",
    "What if {concept} didn't exist - what would change?",
    "Is {concept} always true? Can you think of exceptions?",
  ],
  reasoning: [
    "How did you arrive at that conclusion about {concept}?",
    "What evidence supports your view on {concept}?",
    "Can you walk me through your reasoning on {concept}?",
    "What makes you confident about {concept}?",
  ],
  evidence: [
    "What evidence do we have for {concept}?",
    "How could we test if {concept} is true?",
    "What would prove {concept} wrong?",
    "Where did the idea of {concept} come from?",
  ],
  perspective: [
    "How might someone who disagrees view {concept}?",
    "What's another way to think about {concept}?",
    "Who benefits from {concept}? Who doesn't?",
    "How has our understanding of {concept} changed over time?",
  ],
  implication: [
    "What would happen if {concept} were true/false?",
    "What are the consequences of {concept}?",
    "How does {concept} affect other things?",
    "If we accept {concept}, what else must we accept?",
  ],
};

// Generate a specific Socratic question
export function generateSocraticQuestion(
  type: SocraticQuestion['purpose'],
  concept: string
): string {
  const templates = socraticTemplates[type];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{concept}', concept);
}

// Analyze student response quality
export function analyzeResponseQuality(response: string): {
  depth: 'shallow' | 'moderate' | 'deep';
  hasReasoning: boolean;
  hasExamples: boolean;
  needsGuidance: boolean;
  feedback: string;
} {
  const wordCount = response.split(/\s+/).length;
  const hasReasoning = /because|since|therefore|thus|so|hence/i.test(response);
  const hasExamples = /example|instance|such as|like|for instance/i.test(response);
  const hasQuestions = /\?/.test(response);

  let depth: 'shallow' | 'moderate' | 'deep' = 'shallow';
  if (wordCount > 50 && hasReasoning) {
    depth = 'deep';
  } else if (wordCount > 20 || hasReasoning || hasExamples) {
    depth = 'moderate';
  }

  const needsGuidance = depth === 'shallow' || (!hasReasoning && !hasExamples);

  let feedback = '';
  if (depth === 'deep') {
    feedback = '✨ Excellent reasoning! You\'re thinking critically.';
  } else if (depth === 'moderate') {
    feedback = '👍 Good start! Can you elaborate on your reasoning?';
  } else {
    feedback = '🤔 Let\'s dig deeper. What makes you think that?';
  }

  return {
    depth,
    hasReasoning,
    hasExamples,
    needsGuidance,
    feedback,
  };
}

// Store Socratic session for learning analytics
export function saveSocraticSession(session: {
  userId: string;
  topic: string;
  exchanges: number;
  quality: 'shallow' | 'moderate' | 'deep';
  completedAt: Date;
}): void {
  try {
    const sessions = getSocraticHistory();
    sessions.push(session);
    localStorage.setItem('lynxa-socratic-history', JSON.stringify(sessions.slice(-50)));
  } catch (error) {
    console.error('Failed to save Socratic session:', error);
  }
}

export function getSocraticHistory(): any[] {
  try {
    const stored = localStorage.getItem('lynxa-socratic-history');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

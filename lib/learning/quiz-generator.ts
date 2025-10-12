// Adaptive Quiz Generation System
'use client';

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
};

export type QuizResult = {
  questionId: string;
  userAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
};

export type QuizSession = {
  userId: string;
  topic: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  score: number;
  weakTopics: string[];
  startTime: number;
  endTime?: number;
};

// Generate quiz prompt for AI
export function generateQuizPrompt(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', count: number = 5): string {
  return `Generate ${count} multiple-choice questions on the topic: "${topic}"

**Requirements:**
- Difficulty level: ${difficulty}
- Format each question as JSON:
{
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why this answer is correct",
  "difficulty": "${difficulty}",
  "topic": "${topic}"
}

**Guidelines:**
- Make questions test understanding, not just memorization
- Include distractors that address common misconceptions
- Provide clear, educational explanations
- Vary question types (conceptual, application, analysis)
- Ensure only ONE correct answer per question

Return ONLY a JSON array of questions, no additional text.`;
}

// Parse AI response into quiz questions
export function parseQuizResponse(response: string): QuizQuestion[] {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    
    const questions = JSON.parse(jsonString);
    
    return questions.map((q: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
      topic: q.topic,
    }));
  } catch (error) {
    console.error('Failed to parse quiz response:', error);
    throw new Error('Invalid quiz format received from AI');
  }
}

// Calculate quiz score and identify weak areas
export function calculateQuizResults(session: QuizSession): {
  score: number;
  percentage: number;
  weakTopics: string[];
  strengths: string[];
  feedback: string;
} {
  const totalQuestions = session.questions.length;
  const correctAnswers = session.results.filter(r => r.isCorrect).length;
  const score = correctAnswers;
  const percentage = (correctAnswers / totalQuestions) * 100;

  // Identify weak topics (questions answered incorrectly)
  const weakTopics = session.results
    .filter(r => !r.isCorrect)
    .map(r => {
      const question = session.questions.find(q => q.id === r.questionId);
      return question?.topic || 'Unknown';
    })
    .filter((topic, index, self) => self.indexOf(topic) === index);

  // Identify strengths (questions answered correctly)
  const strengths = session.results
    .filter(r => r.isCorrect)
    .map(r => {
      const question = session.questions.find(q => q.id === r.questionId);
      return question?.topic || 'Unknown';
    })
    .filter((topic, index, self) => self.indexOf(topic) === index);

  // Generate feedback
  let feedback = '';
  if (percentage >= 90) {
    feedback = '🌟 Excellent! You have a strong grasp of this topic.';
  } else if (percentage >= 70) {
    feedback = '👍 Good job! You understand most concepts well.';
  } else if (percentage >= 50) {
    feedback = '📚 Fair performance. Review the weak areas and try again.';
  } else {
    feedback = '💪 Keep practicing! Focus on understanding the fundamentals.';
  }

  if (weakTopics.length > 0) {
    feedback += `\n\n**Areas to improve:** ${weakTopics.join(', ')}`;
  }

  return {
    score,
    percentage,
    weakTopics,
    strengths,
    feedback,
  };
}

// Generate adaptive follow-up questions based on performance
export function generateAdaptivePrompt(results: QuizResult[], questions: QuizQuestion[]): string {
  const weakQuestions = results
    .filter(r => !r.isCorrect)
    .map(r => questions.find(q => q.id === r.questionId))
    .filter(Boolean);

  if (weakQuestions.length === 0) {
    return 'Great job! You answered all questions correctly. Would you like to try harder questions or explore a new topic?';
  }

  const weakTopics = [...new Set(weakQuestions.map(q => q?.topic))].filter(Boolean);

  return `You struggled with these topics: ${weakTopics.join(', ')}

Let me create a focused lesson to help you master these concepts. I'll:
1. Explain the core concepts in simpler terms
2. Provide step-by-step examples
3. Show common mistakes to avoid
4. Give you practice problems with solutions

Ready to improve your understanding?`;
}

// Store quiz session in browser storage
export function saveQuizSession(session: QuizSession): void {
  try {
    const sessions = getQuizHistory();
    sessions.push(session);
    
    // Keep only last 50 sessions
    const recentSessions = sessions.slice(-50);
    
    localStorage.setItem('lynxa-quiz-history', JSON.stringify(recentSessions));
  } catch (error) {
    console.error('Failed to save quiz session:', error);
  }
}

// Retrieve quiz history
export function getQuizHistory(): QuizSession[] {
  try {
    const stored = localStorage.getItem('lynxa-quiz-history');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve quiz history:', error);
    return [];
  }
}

// Get learning analytics
export function getLearningAnalytics(userId: string): {
  totalQuizzes: number;
  averageScore: number;
  strongTopics: string[];
  weakTopics: string[];
  improvementTrend: number;
} {
  const history = getQuizHistory().filter(s => s.userId === userId);

  if (history.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      strongTopics: [],
      weakTopics: [],
      improvementTrend: 0,
    };
  }

  const totalQuizzes = history.length;
  const averageScore = history.reduce((sum, s) => sum + s.score, 0) / totalQuizzes;

  // Aggregate weak topics across all sessions
  const allWeakTopics = history.flatMap(s => s.weakTopics);
  const weakTopicCounts = allWeakTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weakTopics = Object.entries(weakTopicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);

  // Calculate improvement trend (compare recent vs older scores)
  const recentScores = history.slice(-5).map(s => s.score);
  const olderScores = history.slice(0, -5).map(s => s.score);
  
  const recentAvg = recentScores.length > 0 
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length 
    : 0;
  const olderAvg = olderScores.length > 0 
    ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length 
    : recentAvg;

  const improvementTrend = recentAvg - olderAvg;

  return {
    totalQuizzes,
    averageScore,
    strongTopics: [],
    weakTopics,
    improvementTrend,
  };
}

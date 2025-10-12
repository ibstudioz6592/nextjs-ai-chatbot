// Personalized Learning Path System
'use client';

export type LearningModule = {
  id: string;
  title: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  estimatedTime: number; // minutes
  completed: boolean;
  score?: number;
  completedAt?: Date;
};

export type LearningPath = {
  userId: string;
  currentModule: string | null;
  modules: LearningModule[];
  progress: number; // 0-100
  startedAt: Date;
  lastActivity: Date;
  totalTimeSpent: number; // minutes
};

export type LearningRecommendation = {
  nextModule: LearningModule;
  reason: string;
  prerequisites: string[];
  estimatedCompletion: string;
};

// Initialize a new learning path
export function createLearningPath(userId: string, topic: string): LearningPath {
  return {
    userId,
    currentModule: null,
    modules: [],
    progress: 0,
    startedAt: new Date(),
    lastActivity: new Date(),
    totalTimeSpent: 0,
  };
}

// Get or create learning path from storage
export function getLearningPath(userId: string): LearningPath | null {
  try {
    const stored = localStorage.getItem(`lynxa-path-${userId}`);
    if (!stored) return null;

    const path = JSON.parse(stored);
    // Convert date strings back to Date objects
    path.startedAt = new Date(path.startedAt);
    path.lastActivity = new Date(path.lastActivity);
    path.modules = path.modules.map((m: any) => ({
      ...m,
      completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
    }));

    return path;
  } catch (error) {
    console.error('Failed to load learning path:', error);
    return null;
  }
}

// Save learning path to storage
export function saveLearningPath(path: LearningPath): void {
  try {
    localStorage.setItem(`lynxa-path-${path.userId}`, JSON.stringify(path));
  } catch (error) {
    console.error('Failed to save learning path:', error);
  }
}

// Mark a module as completed
export function completeModule(
  path: LearningPath,
  moduleId: string,
  score: number
): LearningPath {
  const updatedModules = path.modules.map(module => {
    if (module.id === moduleId) {
      return {
        ...module,
        completed: true,
        score,
        completedAt: new Date(),
      };
    }
    return module;
  });

  const completedCount = updatedModules.filter(m => m.completed).length;
  const progress = (completedCount / updatedModules.length) * 100;

  const updatedPath = {
    ...path,
    modules: updatedModules,
    progress,
    lastActivity: new Date(),
  };

  saveLearningPath(updatedPath);
  return updatedPath;
}

// Get next recommended module based on progress and prerequisites
export function getNextRecommendation(path: LearningPath): LearningRecommendation | null {
  // Find incomplete modules where all prerequisites are met
  const availableModules = path.modules.filter(module => {
    if (module.completed) return false;

    // Check if all prerequisites are completed
    const prerequisitesMet = module.prerequisites.every(prereqId => {
      const prereq = path.modules.find(m => m.id === prereqId);
      return prereq?.completed || false;
    });

    return prerequisitesMet;
  });

  if (availableModules.length === 0) {
    return null;
  }

  // Sort by difficulty (easier first) and pick the first one
  const sortedModules = availableModules.sort((a, b) => {
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  const nextModule = sortedModules[0];

  // Generate recommendation reason
  let reason = '';
  if (nextModule.prerequisites.length === 0) {
    reason = 'This is a foundational module - a great place to start!';
  } else {
    const completedPrereqs = nextModule.prerequisites
      .map(id => path.modules.find(m => m.id === id)?.title)
      .filter(Boolean);
    reason = `You've mastered ${completedPrereqs.join(', ')}. Ready for the next step!`;
  }

  return {
    nextModule,
    reason,
    prerequisites: nextModule.prerequisites,
    estimatedCompletion: `~${nextModule.estimatedTime} minutes`,
  };
}

// Generate learning path prompt for AI
export function generateLearningPathPrompt(topic: string, currentLevel: string = 'beginner'): string {
  return `Create a personalized learning path for: "${topic}"

**Student Level:** ${currentLevel}

**Requirements:**
Generate a structured learning path with 5-8 modules, formatted as JSON:

{
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "topic": "Specific topic",
      "difficulty": "beginner|intermediate|advanced",
      "prerequisites": [],
      "estimatedTime": 30,
      "description": "What student will learn"
    }
  ]
}

**Guidelines:**
- Start with fundamentals, progress to advanced
- Each module should build on previous ones
- Include clear prerequisites
- Estimate realistic completion times
- Cover theory, practice, and application
- Make titles engaging and descriptive

Return ONLY the JSON, no additional text.`;
}

// Parse AI response into learning modules
export function parseLearningPathResponse(response: string): LearningModule[] {
  try {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    
    const data = JSON.parse(jsonString);
    
    return data.modules.map((m: any) => ({
      id: m.id,
      title: m.title,
      topic: m.topic,
      difficulty: m.difficulty,
      prerequisites: m.prerequisites || [],
      estimatedTime: m.estimatedTime,
      completed: false,
    }));
  } catch (error) {
    console.error('Failed to parse learning path:', error);
    throw new Error('Invalid learning path format');
  }
}

// Generate progress summary
export function getProgressSummary(path: LearningPath): {
  completedModules: number;
  totalModules: number;
  progress: number;
  timeSpent: number;
  estimatedTimeRemaining: number;
  currentStreak: number;
  nextMilestone: string;
} {
  const completedModules = path.modules.filter(m => m.completed).length;
  const totalModules = path.modules.length;
  const progress = path.progress;

  const remainingModules = path.modules.filter(m => !m.completed);
  const estimatedTimeRemaining = remainingModules.reduce(
    (sum, m) => sum + m.estimatedTime,
    0
  );

  // Calculate streak (consecutive days of activity)
  const currentStreak = calculateStreak(path);

  // Determine next milestone
  let nextMilestone = '';
  if (progress < 25) {
    nextMilestone = '25% Complete - Getting Started!';
  } else if (progress < 50) {
    nextMilestone = '50% Complete - Halfway There!';
  } else if (progress < 75) {
    nextMilestone = '75% Complete - Almost Done!';
  } else if (progress < 100) {
    nextMilestone = '100% Complete - Finish Strong!';
  } else {
    nextMilestone = 'Path Completed! 🎉';
  }

  return {
    completedModules,
    totalModules,
    progress,
    timeSpent: path.totalTimeSpent,
    estimatedTimeRemaining,
    currentStreak,
    nextMilestone,
  };
}

// Calculate learning streak
function calculateStreak(path: LearningPath): number {
  // Simplified: count as 1 day streak if activity within last 24 hours
  const now = new Date();
  const lastActivity = new Date(path.lastActivity);
  const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

  return hoursSinceActivity < 24 ? 1 : 0;
}

// Generate contextual prompt based on learning history
export function generateContextualPrompt(path: LearningPath): string {
  const summary = getProgressSummary(path);
  const recommendation = getNextRecommendation(path);

  let prompt = `**Your Learning Journey:**\n`;
  prompt += `- Progress: ${summary.completedModules}/${summary.totalModules} modules (${Math.round(summary.progress)}%)\n`;
  prompt += `- Time invested: ${summary.timeSpent} minutes\n`;

  if (summary.currentStreak > 0) {
    prompt += `- 🔥 Current streak: ${summary.currentStreak} day(s)\n`;
  }

  if (recommendation) {
    prompt += `\n**Next Step:** ${recommendation.nextModule.title}\n`;
    prompt += `${recommendation.reason}\n`;
    prompt += `Estimated time: ${recommendation.estimatedCompletion}\n`;
  }

  const completedTopics = path.modules
    .filter(m => m.completed)
    .map(m => m.topic);

  if (completedTopics.length > 0) {
    prompt += `\n**Topics you've mastered:** ${completedTopics.join(', ')}\n`;
  }

  return prompt;
}

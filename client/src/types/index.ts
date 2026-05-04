export interface Subject {
  id: string;
  attributes: {
    name: string;
    description: string;
    color: string;
    icon: string;
    user_id: string;
    topics?: { data: Topic[] };
    createdAt: string;
  };
}

export interface Topic {
  id: string;
  attributes: {
    title: string;
    youtube_url: string;
    youtube_id: string;
    transcript: string;
    summary: string;
    key_concepts: string[];
    status: 'pending' | 'processing' | 'ready' | 'error';
    error_message?: string;
    user_id: string;
    subject?: { data: Subject };
    quiz_questions?: { data: QuizQuestion[] };
    flashcards?: { data: Flashcard[] };
    createdAt: string;
  };
}

export interface QuizQuestion {
  id: string;
  attributes: {
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface Flashcard {
  id: string;
  attributes: {
    front: string;
    back: string;
  };
}

export interface UserStats {
  totalTopicsStudied: number;
  quizzesTaken: number;
  avgScore: number;
  flashcardsReviewed: number;
  recentAttempts: QuizAttemptRecord[];
  topicProgress: TopicProgressRecord[];
}

export interface QuizAttemptRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  score: number;
  totalQ: number;
  percentage: number;
  createdAt: string;
}

export interface TopicProgressRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  summaryViewed: boolean;
  quizCompleted: boolean;
  flashcardsDone: boolean;
  bestScore: number;
  completionPct: number;
}
export interface User {
  id: string;
  name?: string | null;
  email: string;
  createdAt: Date;
}

export interface StudySet {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
  folderId?: string | null;
  isFavorite: boolean;
  lastAccessed?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  flashcards?: Flashcard[];
  folder?: Folder | null;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  studySetId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  studySetId: string;
  totalCards: number;
  correctCards: number;
  wrongCards: number;
  createdAt: Date;
  sessionResults?: SessionResult[];
}

export interface SessionResult {
  id: string;
  studySessionId: string;
  flashcardId: string;
  isCorrect: boolean;
  createdAt: Date;
  flashcard?: Flashcard;
}

export interface CardResult {
  flashcardId: string;
  isCorrect: boolean;
}

export interface LearnSession {
  id: string;
  userId: string;
  studySetId: string;
  isCompleted: boolean;
  masteryGoal: number;
  createdAt: Date;
  updatedAt: Date;
  learnProgress?: LearnProgress[];
}

export interface LearnProgress {
  id: string;
  sessionId: string;
  flashcardId: string;
  correctStreak: number;
  totalCorrect: number;
  totalIncorrect: number;
  mastered: boolean;
  lastSeen: Date | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  flashcard?: Flashcard;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  parentId?: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  children?: Folder[];
  studySets?: StudySet[];
  parent?: Folder | null;
}

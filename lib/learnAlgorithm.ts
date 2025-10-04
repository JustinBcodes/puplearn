export interface CardProgress {
  id: string;
  flashcardId: string;
  correctStreak: number;
  totalCorrect: number;
  totalIncorrect: number;
  mastered: boolean;
  lastSeen: Date | null;
  priority: number;
}

export interface LearnCard {
  id: string;
  question: string;
  answer: string;
  progress: CardProgress;
}

export class LearnModeAlgorithm {
  private masteryGoal: number;

  constructor(masteryGoal: number = 2) {
    this.masteryGoal = masteryGoal;
  }

  selectNextCard(cards: LearnCard[]): LearnCard | null {
    const unmasteredCards = cards.filter(card => !card.progress.mastered);
    
    if (unmasteredCards.length === 0) {
      return null;
    }

    const cardsWithWeights = unmasteredCards.map(card => ({
      card,
      weight: this.calculateWeight(card.progress),
    }));

    const totalWeight = cardsWithWeights.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of cardsWithWeights) {
      random -= item.weight;
      if (random <= 0) {
        return item.card;
      }
    }

    return unmasteredCards[0];
  }

  private calculateWeight(progress: CardProgress): number {
    let weight = 100;

    weight += progress.totalIncorrect * 50;
    
    weight -= progress.correctStreak * 20;
    
    if (progress.totalCorrect > 0) {
      weight -= progress.totalCorrect * 10;
    }

    if (progress.lastSeen) {
      const minutesSinceLastSeen = (Date.now() - new Date(progress.lastSeen).getTime()) / 1000 / 60;
      if (minutesSinceLastSeen < 2) {
        weight = Math.max(weight * 0.3, 10);
      }
    }

    return Math.max(weight, 1);
  }

  updateProgress(
    progress: CardProgress,
    isCorrect: boolean
  ): CardProgress {
    const updated = { ...progress };

    if (isCorrect) {
      updated.correctStreak += 1;
      updated.totalCorrect += 1;
      
      if (updated.correctStreak >= this.masteryGoal) {
        updated.mastered = true;
      }
      
      updated.priority = Math.max(updated.priority - 20, 10);
    } else {
      updated.correctStreak = 0;
      updated.totalIncorrect += 1;
      updated.mastered = false;
      
      updated.priority = Math.min(updated.priority + 50, 200);
    }

    updated.lastSeen = new Date();
    
    return updated;
  }

  calculateProgress(cards: LearnCard[]): {
    masteredCount: number;
    totalCount: number;
    percentComplete: number;
  } {
    const masteredCount = cards.filter(card => card.progress.mastered).length;
    const totalCount = cards.length;
    const percentComplete = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

    return {
      masteredCount,
      totalCount,
      percentComplete,
    };
  }

  isSessionComplete(cards: LearnCard[]): boolean {
    return cards.every(card => card.progress.mastered);
  }

  checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    const normalize = (str: string) => 
      str.toLowerCase().trim().replace(/[^\w\s]/g, '');
    
    return normalize(userAnswer) === normalize(correctAnswer);
  }
}


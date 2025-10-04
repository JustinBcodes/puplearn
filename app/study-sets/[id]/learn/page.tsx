'use client';

import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { LearnSession, LearnProgress, Flashcard } from '@/lib/types';
import { LearnModeAlgorithm } from '@/lib/learnAlgorithm';

// Lazy load heavy components
const LearnModeCard = lazy(() => import('@/components/LearnModeCard'));
const LearnComplete = lazy(() => import('@/components/LearnComplete'));

export default function LearnModePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [learnSession, setLearnSession] = useState<LearnSession | null>(null);
  const [currentProgress, setCurrentProgress] = useState<LearnProgress | null>(null);
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [wrongCardIds, setWrongCardIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionState, setSessionState] = useState<'loading' | 'learning' | 'complete'>('loading');
  const [algorithm] = useState(() => new LearnModeAlgorithm(2));

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const selectNextCard = useCallback((session: LearnSession) => {
    const cards = session.learnProgress?.map(progress => ({
      id: progress.flashcard?.id || progress.flashcardId,
      question: progress.flashcard?.question || '',
      answer: progress.flashcard?.answer || '',
      progress: {
        id: progress.id,
        flashcardId: progress.flashcardId,
        correctStreak: progress.correctStreak,
        totalCorrect: progress.totalCorrect,
        totalIncorrect: progress.totalIncorrect,
        mastered: progress.mastered,
        lastSeen: progress.lastSeen ? new Date(progress.lastSeen) : null,
        priority: progress.priority,
      },
    })) || [];

    const nextCard = algorithm.selectNextCard(cards);

    if (!nextCard) {
      setSessionState('complete');
      setIsComplete(true);
      return;
    }

    const nextProgress = session.learnProgress?.find(
      p => p.flashcardId === nextCard.id
    );

    if (nextProgress && nextProgress.flashcard) {
      setCurrentProgress(nextProgress);
      setSessionState('learning');
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('Next progress card missing flashcard data:', nextProgress);
      }
      setSessionState('complete');
      setIsComplete(true);
    }
  }, [algorithm]);

  const initializeSession = useCallback(async (specificFlashcardIds?: string[]) => {
    try {
      setSessionState('loading');
      setIsLoading(true);
      
      const studySetResponse = await fetch(`/api/study-sets/${id}`);
      if (!studySetResponse.ok) {
        throw new Error('Failed to fetch study set');
      }
      const studySetData = await studySetResponse.json();
      
      if (!studySetData.flashcards || studySetData.flashcards.length === 0) {
        throw new Error('Study set has no flashcards');
      }
      
      setAllFlashcards(studySetData.flashcards || []);
      
      const requestBody: any = { studySetId: id, masteryGoal: 2 };
      if (specificFlashcardIds && specificFlashcardIds.length > 0) {
        requestBody.flashcardIds = specificFlashcardIds;
      }
      
      const response = await fetch('/api/learn-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          const errorData = await response.json();
          console.error('Learn session creation failed:', errorData);
        }
        throw new Error('Failed to create learn session');
      }

      const session = await response.json();
      
      if (!session.learnProgress || session.learnProgress.length === 0) {
        throw new Error('No flashcards available for learning');
      }
      
      setLearnSession(session);
      if (!specificFlashcardIds) {
        setWrongCardIds([]);
      }
      setIsComplete(false);
      selectNextCard(session);
      setSessionState('learning');
      setIsLoading(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error initializing learn session:', error);
      }
      alert('Failed to start Learn Mode. Please try again.');
      router.push(`/study-sets/${id}`);
    }
  }, [id, router, selectNextCard]);

  useEffect(() => {
    if (status === 'authenticated') {
      initializeSession();
    }
  }, [status, initializeSession]);

  const handleAnswer = async (isCorrect: boolean) => {
    if (!learnSession || !currentProgress) return;

    if (!isCorrect && currentProgress.flashcardId) {
      setWrongCardIds(prev => {
        if (!prev.includes(currentProgress.flashcardId)) {
          return [...prev, currentProgress.flashcardId];
        }
        return prev;
      });
    }

    try {
      const response = await fetch(`/api/learn-sessions/${learnSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId: currentProgress.id,
          isCorrect,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const updatedProgress = await response.json();

      const updatedSession = {
        ...learnSession,
        learnProgress: learnSession.learnProgress?.map(p =>
          p.id === updatedProgress.id ? { ...updatedProgress, flashcard: p.flashcard } : p
        ),
      };

      setLearnSession(updatedSession);

      const allMastered = updatedSession.learnProgress?.every(p => p.mastered);
      
      if (allMastered) {
        await fetch(`/api/learn-sessions/${learnSession.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCompleted: true }),
        });
        setSessionState('complete');
        setIsComplete(true);
      } else {
        selectNextCard(updatedSession);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating progress:', error);
      }
      alert('Failed to update progress. Please try again.');
    }
  };

  const handleComplete = () => {
    router.push(`/study-sets/${id}`);
  };

  const handleRestart = async () => {
    if (!learnSession) return;

    try {
      await fetch(`/api/learn-sessions/${learnSession.id}`, {
        method: 'DELETE',
      });

      setCurrentProgress(null);
      setLearnSession(null);
      setIsComplete(false);
      setWrongCardIds([]);
      
      await initializeSession();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error restarting session:', error);
      }
      alert('Failed to restart session. Returning to study set...');
      router.push(`/study-sets/${id}`);
    }
  };

  const handleReviewWrong = async () => {
    if (!learnSession) return;
    
    if (wrongCardIds.length === 0) {
      alert('All correct! 🐶 Nothing to review. Starting a new session...');
      await handleRestart();
      return;
    }

    try {
      await fetch(`/api/learn-sessions/${learnSession.id}`, {
        method: 'DELETE',
      });

      setCurrentProgress(null);
      setLearnSession(null);
      setIsComplete(false);
      
      await initializeSession(wrongCardIds);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error starting review session:', error);
      }
      alert('Failed to start review session. Restarting full session...');
      await handleRestart();
    }
  };

  if (status === 'loading' || sessionState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Learn Mode...</p>
        </div>
      </div>
    );
  }

  if (!learnSession || !learnSession.learnProgress || learnSession.learnProgress.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            No flashcards available for learning.
          </p>
          <button
            onClick={() => router.push(`/study-sets/${id}`)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Study Set
          </button>
        </div>
      </div>
    );
  }

  const masteredCount = learnSession.learnProgress?.filter(p => p.mastered).length || 0;
  const totalCards = learnSession.learnProgress?.length || 0;

  const totalCorrect = learnSession.learnProgress?.reduce((sum, p) => sum + p.totalCorrect, 0) || 0;
  const totalIncorrect = learnSession.learnProgress?.reduce((sum, p) => sum + p.totalIncorrect, 0) || 0;

  if (sessionState === 'complete' || isComplete) {
    return (
      <LearnComplete
        studySetId={id}
        studySetTitle={(learnSession as any).studySet?.title || 'Study Set'}
        totalCards={totalCards}
        totalCorrect={totalCorrect}
        totalIncorrect={totalIncorrect}
        wrongCardIds={wrongCardIds}
        onRestart={handleRestart}
        onReviewWrong={handleReviewWrong}
      />
    );
  }

  if (!currentProgress || !currentProgress.flashcard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            Unable to load the next flashcard.
          </p>
          <button
            onClick={() => router.push(`/study-sets/${id}`)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Study Set
          </button>
        </div>
      </div>
    );
  }

  const isLastCard = masteredCount === totalCards - 1 && !currentProgress.mastered;

  const loadingFallback = (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );

  if (sessionState === 'complete' || isComplete) {
    return (
      <Suspense fallback={loadingFallback}>
        <LearnComplete
          studySetId={id}
          studySetTitle={(learnSession as any).studySet?.title || 'Study Set'}
          totalCards={totalCards}
          totalCorrect={totalCorrect}
          totalIncorrect={totalIncorrect}
          wrongCardIds={wrongCardIds}
          onRestart={handleRestart}
          onReviewWrong={handleReviewWrong}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={loadingFallback}>
      <LearnModeCard
        card={currentProgress.flashcard}
        allFlashcards={allFlashcards}
        progress={currentProgress}
        totalCards={totalCards}
        masteredCount={masteredCount}
        onAnswer={handleAnswer}
        onComplete={handleComplete}
        isLastCard={isLastCard}
      />
    </Suspense>
  );
}


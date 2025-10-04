'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import StudyCard from '@/components/StudyCard';
import FocusModeCard from '@/components/FocusModeCard';
import SessionResults from '@/components/SessionResults';
import CorgiEncouragement from '@/components/CorgiEncouragement';
import CorgiMascot from '@/components/CorgiMascot';
import { StudySet, Flashcard, CardResult } from '@/lib/types';

export default function StudyModePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardResults, setCardResults] = useState<Map<string, boolean>>(new Map());
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestudyMode, setIsRestudyMode] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchStudySet();
    }
  }, [status, id]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('mode') === 'focus') {
      setFocusMode(true);
    }
  }, []);

  const fetchStudySet = async () => {
    try {
      const response = await fetch(`/api/study-sets/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStudySet(data);
        setAllFlashcards(data.flashcards || []);
        setFlashcards(data.flashcards || []);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching study set:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      completeSession();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMarkCorrect = () => {
    const currentCard = flashcards[currentIndex];
    setCardResults(new Map(cardResults.set(currentCard.id, true)));
    setShowEncouragement(true);
    
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        completeSession();
      }
    }, 1500);
  };

  const handleMarkWrong = () => {
    const currentCard = flashcards[currentIndex];
    setCardResults(new Map(cardResults.set(currentCard.id, false)));
    
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        completeSession();
      }
    }, 500);
  };

  const completeSession = async () => {
    const correctCount = Array.from(cardResults.values()).filter((v) => v).length;
    const wrongCount = Array.from(cardResults.values()).filter((v) => !v).length;

    const results: CardResult[] = Array.from(cardResults.entries()).map(
      ([flashcardId, isCorrect]) => ({
        flashcardId,
        isCorrect,
      })
    );

    try {
      await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studySetId: id,
          totalCards: flashcards.length,
          correctCards: correctCount,
          wrongCards: wrongCount,
          results,
        }),
      });
    } catch (error) {
      console.error('Error saving study session:', error);
    }

    setSessionComplete(true);
  };

  const handleRestudyWrong = () => {
    const wrongCardIds = Array.from(cardResults.entries())
      .filter(([, isCorrect]) => !isCorrect)
      .map(([id]) => id);

    const wrongCards = allFlashcards.filter((card) =>
      wrongCardIds.includes(card.id)
    );

    setFlashcards(wrongCards);
    setCardResults(new Map());
    setCurrentIndex(0);
    setSessionComplete(false);
    setIsRestudyMode(true);
  };

  const handleFinish = () => {
    router.push(`/study-sets/${id}`);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray(flashcards);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsShuffled(true);
  };

  const getWrongCardDetails = () => {
    return Array.from(cardResults.entries())
      .filter(([, isCorrect]) => !isCorrect)
      .map(([flashcardId, isCorrect]) => {
        const flashcard = allFlashcards.find((c) => c.id === flashcardId);
        return {
          flashcard: flashcard!,
          result: { flashcardId, isCorrect },
        };
      })
      .filter((item) => item.flashcard);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CorgiMascot size={120} className="mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading study session...</p>
        </div>
      </div>
    );
  }

  if (!session || !studySet) {
    return null;
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <CorgiMascot size={120} className="mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          No Cards to Study Yet
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Add some flashcards to this study set first!
        </p>
        <Link
          href={`/study-sets/${id}`}
          className="inline-block bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-md"
        >
          Add Flashcards
        </Link>
      </div>
    );
  }

  if (sessionComplete) {
    const correctCount = Array.from(cardResults.values()).filter((v) => v).length;
    const wrongCount = Array.from(cardResults.values()).filter((v) => !v).length;

    return (
      <SessionResults
        totalCards={flashcards.length}
        correctCards={correctCount}
        wrongCards={wrongCount}
        wrongCardDetails={getWrongCardDetails()}
        onRestudyWrong={handleRestudyWrong}
        onFinish={handleFinish}
      />
    );
  }

  const hasMarkedCurrent = cardResults.has(flashcards[currentIndex].id);
  const correctCount = Array.from(cardResults.values()).filter((v) => v).length;
  const wrongCount = Array.from(cardResults.values()).filter((v) => !v).length;

  if (focusMode) {
    return (
      <FocusModeCard
        card={flashcards[currentIndex]}
        currentIndex={currentIndex}
        totalCards={flashcards.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onMarkCorrect={handleMarkCorrect}
        onMarkWrong={handleMarkWrong}
        onExitFocus={() => setFocusMode(false)}
        hasMarkedCurrent={hasMarkedCurrent}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <CorgiMascot size={80} />
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {studySet.title}
              {isRestudyMode && <span className="text-red-600 dark:text-red-400 ml-2">(Review Mode)</span>}
              {isShuffled && <span className="text-blue-600 dark:text-blue-400 ml-2">🔀</span>}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Progress: {cardResults.size} / {flashcards.length} cards answered
              {cardResults.size > 0 && (
                <span className="ml-4">
                  <span className="text-green-600 dark:text-green-400">✅ {correctCount}</span>
                  {' | '}
                  <span className="text-red-600 dark:text-red-400">❌ {wrongCount}</span>
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFocusMode(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <span>🎯</span>
            <span>Focus Mode</span>
          </button>
          <button
            onClick={handleShuffle}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <span>🔀</span>
            <span>Shuffle</span>
          </button>
          <Link
            href={`/study-sets/${id}`}
            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors px-4 py-2"
          >
            ← Exit
          </Link>
        </div>
      </div>

      <StudyCard
        card={flashcards[currentIndex]}
        currentIndex={currentIndex}
        totalCards={flashcards.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onMarkCorrect={handleMarkCorrect}
        onMarkWrong={handleMarkWrong}
        hasMarkedCurrent={hasMarkedCurrent}
      />

      <div className="mt-8 text-center">
        <div className="inline-block bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Session Progress</p>
          <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-primary-500 dark:bg-primary-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(cardResults.size / flashcards.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {cardResults.size} / {flashcards.length} cards answered
          </p>
        </div>
      </div>

      {!focusMode && (
        <CorgiEncouragement
          show={showEncouragement}
          onHide={() => setShowEncouragement(false)}
        />
      )}
    </div>
  );
}

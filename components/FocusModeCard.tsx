'use client';

import { useState, useEffect } from 'react';
import { Flashcard } from '@/lib/types';

interface FocusModeCardProps {
  card: Flashcard;
  currentIndex: number;
  totalCards: number;
  onNext: () => void;
  onPrevious: () => void;
  onMarkCorrect: () => void;
  onMarkWrong: () => void;
  onExitFocus: () => void;
  hasMarkedCurrent: boolean;
}

export default function FocusModeCard({
  card,
  currentIndex,
  totalCards,
  onNext,
  onPrevious,
  onMarkCorrect,
  onMarkWrong,
  onExitFocus,
  hasMarkedCurrent,
}: FocusModeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [card.id, currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitFocus();
      } else if (e.key === 'ArrowLeft' && !hasMarkedCurrent && currentIndex > 0) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasMarkedCurrent && currentIndex < totalCards - 1) {
        onNext();
      } else if ((e.key === ' ' || e.key === 'Enter') && !hasMarkedCurrent) {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (e.key === '1' && isFlipped && !hasMarkedCurrent) {
        e.preventDefault();
        onMarkCorrect();
      } else if (e.key === '2' && isFlipped && !hasMarkedCurrent) {
        e.preventDefault();
        onMarkWrong();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onNext, onPrevious, isFlipped, hasMarkedCurrent, onMarkCorrect, onMarkWrong, currentIndex, totalCards, onExitFocus]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header - Minimal */}
        <div className="flex justify-between items-center mb-6 text-gray-600 dark:text-gray-400">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {totalCards}
          </span>
          <button
            onClick={onExitFocus}
            className="text-sm px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            Exit Focus (ESC)
          </button>
        </div>

        {/* Card - Large and Centered */}
        <div
          onClick={() => !hasMarkedCurrent && setIsFlipped(!isFlipped)}
          className={`${!hasMarkedCurrent ? 'cursor-pointer' : ''}`}
        >
          {!isFlipped ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-16 min-h-[400px] flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800">
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center leading-relaxed">
                {card.question}
              </p>
              {!hasMarkedCurrent && (
                <p className="text-gray-400 dark:text-gray-600 mt-8 text-sm">
                  Press Space or Click to flip
                </p>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow-xl p-16 min-h-[400px] flex flex-col items-center justify-center border border-gray-700 dark:border-gray-800">
              <p className="text-4xl font-bold text-white dark:text-gray-100 text-center leading-relaxed whitespace-pre-wrap">
                {card.answer}
              </p>
            </div>
          )}
        </div>

        {/* Actions - Minimal */}
        {isFlipped && !hasMarkedCurrent && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkWrong();
              }}
              className="bg-gray-700 dark:bg-gray-800 text-white px-8 py-3 rounded hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Wrong (2)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkCorrect();
              }}
              className="bg-gray-900 dark:bg-gray-700 text-white px-8 py-3 rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Correct (1)
            </button>
          </div>
        )}

        {hasMarkedCurrent && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-6 py-3 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex === totalCards - 1}
              className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


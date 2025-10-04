'use client';

import { useState, useEffect } from 'react';
import { Flashcard } from '@/lib/types';

interface StudyCardProps {
  card: Flashcard;
  currentIndex: number;
  totalCards: number;
  onNext: () => void;
  onPrevious: () => void;
  onMarkCorrect: () => void;
  onMarkWrong: () => void;
  hasMarkedCurrent: boolean;
}

export default function StudyCard({
  card,
  currentIndex,
  totalCards,
  onNext,
  onPrevious,
  onMarkCorrect,
  onMarkWrong,
  hasMarkedCurrent,
}: StudyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [card.id, currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && !hasMarkedCurrent && currentIndex > 0) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasMarkedCurrent && currentIndex < totalCards - 1) {
        onNext();
      } else if ((e.key === ' ' || e.key === 'Enter') && !hasMarkedCurrent) {
        e.preventDefault();
        handleFlip();
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
  }, [onNext, onPrevious, isFlipped, hasMarkedCurrent, onMarkCorrect, onMarkWrong, currentIndex, totalCards]);

  const handleFlip = () => {
    if (!hasMarkedCurrent) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-gray-600 dark:text-slate-400 font-medium">
          Card {currentIndex + 1} of {totalCards}
        </span>
        <div className="flex gap-2 flex-wrap">
          {!hasMarkedCurrent && (
            <>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-300 dark:border-slate-600 text-sm">←</kbd>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-300 dark:border-slate-600 text-sm">→</kbd>
              <span className="text-gray-600 dark:text-slate-400 text-sm">to navigate</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-300 dark:border-slate-600 text-sm ml-4">Space</kbd>
              <span className="text-gray-600 dark:text-slate-400 text-sm">to flip</span>
            </>
          )}
          {isFlipped && !hasMarkedCurrent && (
            <>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-300 dark:border-slate-600 text-sm ml-4">1</kbd>
              <span className="text-gray-600 dark:text-slate-400 text-sm">correct</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-300 dark:border-slate-600 text-sm">2</kbd>
              <span className="text-gray-600 dark:text-slate-400 text-sm">wrong</span>
            </>
          )}
        </div>
      </div>

      <div
        onClick={handleFlip}
        className={`relative h-96 ${!hasMarkedCurrent ? 'cursor-pointer' : ''}`}
      >
        {!isFlipped ? (
          <div className="w-full h-full animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-12 h-full flex flex-col items-center justify-center border-4 border-primary-300 dark:border-teal-500 transition-all">
              <span className="text-sm text-primary-600 dark:text-teal-300 font-medium mb-4 uppercase tracking-wide">
                Question
              </span>
              <p className="text-3xl font-bold text-gray-800 dark:text-slate-100 text-center">
                {card.question}
              </p>
              {!hasMarkedCurrent && (
                <p className="text-gray-400 dark:text-slate-500 mt-8 text-sm flex items-center gap-2">
                  <span>Flip me! 🐶</span>
                  <span className="text-xs">(Space or Click)</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full animate-fadeIn">
            <div className="bg-primary-500 dark:bg-teal-600 rounded-2xl shadow-2xl p-12 h-full flex flex-col items-center justify-center border-4 border-primary-700 dark:border-teal-700 transition-all">
              <span className="text-sm text-primary-100 dark:text-teal-100 font-medium mb-4 uppercase tracking-wide">
                Answer
              </span>
              <p className="text-3xl font-bold text-white dark:text-slate-100 text-center whitespace-pre-wrap">
                {card.answer}
              </p>
              {!hasMarkedCurrent && (
                <p className="text-primary-100 dark:text-teal-100 mt-8 text-sm">
                  Good try! Here&apos;s the answer 🐾
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {isFlipped && !hasMarkedCurrent && (
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onMarkWrong}
            className="bg-red-500 text-white px-8 py-4 rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md text-lg flex items-center gap-2"
          >
            <span>❌</span>
            <span>Got it Wrong</span>
          </button>
          <button
            onClick={onMarkCorrect}
            className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md text-lg flex items-center gap-2"
          >
            <span>✅</span>
            <span>Got it Right</span>
          </button>
        </div>
      )}

      {hasMarkedCurrent && (
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-slate-700"
          >
            ← Previous
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === totalCards - 1}
            className="bg-primary-500 dark:bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Card →
          </button>
        </div>
      )}
    </div>
  );
}

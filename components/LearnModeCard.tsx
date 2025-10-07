'use client';

import { useState, useEffect } from 'react';
import { Flashcard, LearnProgress } from '@/lib/types';
import CorgiMascot from './CorgiMascot';

interface LearnModeCardProps {
  card: Flashcard;
  allFlashcards: Flashcard[];
  progress: LearnProgress;
  totalCards: number;
  masteredCount: number;
  onAnswer: (isCorrect: boolean) => void;
  onComplete: () => void;
  isLastCard: boolean;
}

export default function LearnModeCard({
  card,
  allFlashcards,
  progress,
  totalCards,
  masteredCount,
  onAnswer,
  onComplete,
  isLastCard,
}: LearnModeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setIsProcessing(false);
  }, [card.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only allow keyboard shortcuts after card is flipped
      if (!isFlipped || isProcessing) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped, isProcessing]);

  const handleFlip = () => {
    if (!isProcessing) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (isProcessing || !isFlipped) return;
    
    setIsProcessing(true);
    
    // Small delay for visual feedback
    setTimeout(() => {
      onAnswer(isCorrect);
      setIsProcessing(false);
    }, 300);
  };

  const progressPercent = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  const getEncouragementMessage = () => {
    if (masteredCount === 0) return "Let's get started! 🐶";
    if (progressPercent < 25) return "Great start! Keep going! 🐾";
    if (progressPercent < 50) return "You're doing amazing! 🌟";
    if (progressPercent < 75) return "More than halfway there! 💪";
    if (progressPercent < 100) return "Almost there! You've got this! 🎯";
    return "Perfect! All mastered! 🎉";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-[#0a1128] dark:to-[#0a1128] p-4">
      <div className="max-w-3xl mx-auto pt-8 pb-4">
        <button
          onClick={onComplete}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-teal-300 font-medium mb-4 flex items-center gap-2 transition-colors"
        >
          <span>←</span>
          <span>Back to Study Set</span>
        </button>
      </div>
      <div className="w-full max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {masteredCount} of {totalCards} mastered
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-teal-500 dark:to-teal-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div 
          onClick={handleFlip}
          className={`relative min-h-[400px] cursor-pointer mb-6 transition-transform duration-300 hover:scale-[1.02] ${isProcessing ? 'pointer-events-none' : ''}`}
          style={{ perspective: '1000px' }}
        >
          <div
            className={`relative w-full min-h-[400px] transition-all duration-500 ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front of card (Question) */}
            <div
              className={`absolute inset-0 bg-white dark:bg-[#152850] rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-blue-200 dark:border-blue-900 flex flex-col justify-center items-center ${
                isFlipped ? 'invisible' : ''
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="mb-6 text-center">
                <span className="text-sm text-blue-600 dark:text-teal-300 font-semibold uppercase tracking-wide">
                  Question
                </span>
                {progress.totalIncorrect > 0 && !progress.mastered && (
                  <span className="ml-3 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                    Needs practice
                  </span>
                )}
                {progress.correctStreak > 0 && !progress.mastered && (
                  <span className="ml-3 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Streak: {progress.correctStreak}
                  </span>
                )}
              </div>
              
              <p className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 text-center leading-relaxed mb-8">
                {card.question}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Click to reveal answer
              </p>
            </div>

            {/* Back of card (Answer) */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-teal-600 dark:to-blue-700 rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-blue-300 dark:border-teal-700 flex flex-col justify-center items-center ${
                !isFlipped ? 'invisible' : ''
              }`}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="mb-6 text-center">
                <span className="text-sm text-white font-semibold uppercase tracking-wide">
                  Answer
                </span>
              </div>
              
              <p className="text-2xl md:text-4xl font-bold text-white text-center leading-relaxed mb-8">
                {card.answer}
              </p>

              <p className="text-sm text-white/80 text-center">
                Did you get it right?
              </p>
            </div>
          </div>
        </div>

        {/* Right/Wrong Buttons (only show when flipped) */}
        {isFlipped && (
          <div className="flex gap-4 mb-6 animate-fadeIn">
            <button
              onClick={() => handleAnswer(false)}
              disabled={isProcessing}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-bold py-6 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <span className="text-2xl">❌</span>
              <div className="text-left">
                <div>Wrong</div>
                <div className="text-xs opacity-80">← or Left Arrow</div>
              </div>
            </button>
            
            <button
              onClick={() => handleAnswer(true)}
              disabled={isProcessing}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-bold py-6 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <div className="text-right">
                <div>Right</div>
                <div className="text-xs opacity-80">→ or Right Arrow</div>
              </div>
              <span className="text-2xl">✅</span>
            </button>
          </div>
        )}

        {/* Encouragement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CorgiMascot size={50} />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getEncouragementMessage()}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {2 - progress.correctStreak > 0 ? (
              `${2 - progress.correctStreak} more correct to master`
            ) : (
              'One more correct!'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

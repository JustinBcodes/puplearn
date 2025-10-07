'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handleFlip = useCallback(() => {
    if (!isProcessing) {
      setIsFlipped((prev) => !prev);
    }
  }, [isProcessing]);

  const handleAnswer = useCallback(async (isCorrect: boolean) => {
    if (isProcessing || !isFlipped) return;
    
    setIsProcessing(true);
    
    // Minimal delay for smooth transition
    setTimeout(() => {
      onAnswer(isCorrect);
      setIsProcessing(false);
    }, 200);
  }, [isProcessing, isFlipped, onAnswer]);

  // Comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Spacebar to flip
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (!isProcessing) {
          handleFlip();
        }
        return;
      }

      // Arrow keys only work after card is flipped
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
  }, [isFlipped, isProcessing, handleFlip, handleAnswer]);

  const progressPercent = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  const getEncouragementMessage = () => {
    if (masteredCount === 0) return "Let's get started!";
    if (progressPercent < 25) return "Great start! Keep going!";
    if (progressPercent < 50) return "You're doing amazing!";
    if (progressPercent < 75) return "More than halfway there!";
    if (progressPercent < 100) return "Almost there! You've got this!";
    return "Perfect! All mastered!";
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
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {masteredCount} of {totalCards} mastered
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-teal-500 dark:to-teal-600 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Flashcard - Framer Motion Implementation */}
        <div 
          onClick={handleFlip}
          className={`relative mb-6 ${isProcessing ? 'pointer-events-none' : 'cursor-pointer'}`}
          style={{ perspective: '1500px', minHeight: '400px' }}
        >
          <motion.div
            className="relative w-full"
            style={{ 
              transformStyle: 'preserve-3d',
              minHeight: '400px'
            }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.4, 0, 0.2, 1],
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
          >
            {/* Front of card (Question) */}
            <motion.div
              className="absolute inset-0 bg-white dark:bg-[#152850] rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-blue-200 dark:border-blue-900 flex flex-col justify-center items-center"
              style={{ 
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                willChange: 'transform',
                minHeight: '400px'
              }}
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
                Click or press <kbd className="px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded">Space</kbd> to flip
              </p>
            </motion.div>

            {/* Back of card (Answer) */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-teal-600 dark:to-blue-700 rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-blue-300 dark:border-teal-700 flex flex-col justify-center items-center"
              style={{ 
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                willChange: 'transform',
                minHeight: '400px'
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
            </motion.div>
          </motion.div>
        </div>

        {/* Right/Wrong Buttons (only show when flipped) */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div 
              className="flex gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={() => handleAnswer(false)}
                disabled={isProcessing}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
              >
                <div className="text-left">
                  <div className="text-red-100 font-semibold">Incorrect</div>
                  <div className="text-xs text-red-200 opacity-80">← or Left Arrow</div>
                </div>
              </motion.button>
              
              <motion.button
                onClick={() => handleAnswer(true)}
                disabled={isProcessing}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
              >
                <div className="text-right">
                  <div className="text-green-100 font-semibold">Correct</div>
                  <div className="text-xs text-green-200 opacity-80">→ or Right Arrow</div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Encouragement */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
}

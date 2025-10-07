'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import CorgiMascot from './CorgiMascot';

interface LearnCompleteProps {
  studySetId: string;
  studySetTitle: string;
  totalCards: number;
  totalCorrect: number;
  totalIncorrect: number;
  wrongCardIds: string[];
  onRestart: () => void;
  onReviewWrong: () => void;
}

export default function LearnComplete({
  studySetId,
  studySetTitle,
  totalCards,
  totalCorrect,
  totalIncorrect,
  wrongCardIds,
  onRestart,
  onReviewWrong,
}: LearnCompleteProps) {
  const accuracy = totalCorrect + totalIncorrect > 0
    ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
    : 0;

  const hasWrongCards = wrongCardIds.length > 0;

  const getCorgiMessage = () => {
    if (accuracy >= 90) {
      return "Pawsome job! You're really fetching knowledge!";
    } else if (accuracy >= 80) {
      return "Great work! You're on the right track!";
    } else if (accuracy >= 70) {
      return "Good effort! Keep practicing and you'll get there!";
    } else {
      return "Don't worry, I'll help you chase down those tough ones!";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-[#0a1128] dark:to-[#0a1128] flex items-center justify-center p-4">
      <motion.div 
        className="max-w-2xl w-full bg-white dark:bg-[#152850] rounded-2xl shadow-2xl p-8 md:p-12 text-center border border-blue-200 dark:border-blue-900"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <CorgiMascot size={150} className="mx-auto mb-6" />
        </motion.div>
        
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          You&apos;ve Mastered This Set!
        </motion.h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
          You completed <span className="font-bold text-blue-600 dark:text-teal-400">{totalCards}</span> flashcards from{' '}
          <span className="font-semibold text-blue-600 dark:text-teal-400">{studySetTitle}</span>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 py-6 border-t border-b border-gray-200 dark:border-slate-700">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-teal-400 mb-2">
              {totalCards}
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Mastered
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {totalCorrect}
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Correct
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
              {totalIncorrect}
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Incorrect
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-teal-400 mb-2">
              {accuracy}%
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Accuracy
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg p-6 mb-8 border-2 border-blue-200 dark:border-teal-700">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CorgiMascot size={50} />
            <p className="text-xl font-bold text-blue-600 dark:text-teal-300">
              {accuracy >= 80 ? 'Amazing!' : 'Keep Going!'}
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {getCorgiMessage()}
          </p>
        </div>

        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {hasWrongCards && (
            <motion.button
              onClick={onReviewWrong}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Relearn Mistakes ({wrongCardIds.length} cards)</span>
            </motion.button>
          )}

          <motion.button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Start New Session</span>
          </motion.button>

          <Link
            href="/dashboard"
            className="w-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-100 font-semibold py-4 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 inline-block"
          >
            <motion.span
              className="block"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Return to Dashboard
            </motion.span>
          </Link>
        </motion.div>

        {hasWrongCards && (
          <motion.p 
            className="mt-6 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Tip: Relearn your mistakes to build stronger memory connections!
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

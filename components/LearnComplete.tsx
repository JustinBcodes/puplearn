'use client';

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
      return "Pawsome job! 🐶 You're really fetching knowledge!";
    } else if (accuracy >= 80) {
      return "Great work! 🐾 You're on the right track!";
    } else if (accuracy >= 70) {
      return "Good effort! 🐕 Keep practicing and you'll get there!";
    } else {
      return "Don't worry, I'll help you chase down those tough ones! 🐾";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center border dark:border-slate-700">
        <CorgiMascot size={150} className="mx-auto mb-6 animate-bounce" />
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-slate-100 mb-4">
          🎉 Session Complete!
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-slate-300 mb-8">
          You mastered <span className="font-bold text-primary-600 dark:text-teal-400">{totalCards}/{totalCards}</span> cards in{' '}
          <span className="font-semibold text-primary-600 dark:text-teal-400">{studySetTitle}</span>!
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 py-6 border-t border-b border-gray-200 dark:border-slate-700">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-teal-400 mb-2">
              {totalCards}
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              Mastered
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {totalCorrect}
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              Correct
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
              {totalIncorrect}
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              Incorrect
            </p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-teal-400 mb-2">
              {accuracy}%
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              Accuracy
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-800 rounded-lg p-6 mb-8 border-2 border-primary-200 dark:border-teal-700">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CorgiMascot size={50} />
            <p className="text-xl font-bold text-primary-600 dark:text-teal-300">
              {accuracy >= 80 ? 'Amazing!' : 'Keep Going!'}
            </p>
          </div>
          <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
            {getCorgiMessage()}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-xl">🔄</span>
            <span>Continue Learning</span>
          </button>

          {hasWrongCards && (
            <button
              onClick={onReviewWrong}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span className="text-xl">📝</span>
              <span>Review Wrong Cards ({wrongCardIds.length})</span>
            </button>
          )}

          <Link
            href={`/study-sets/${studySetId}`}
            className="w-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-100 font-semibold py-4 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-xl">📚</span>
            <span>Exit to Study Set</span>
          </Link>
        </div>

        {hasWrongCards && (
          <p className="mt-6 text-sm text-gray-500 dark:text-slate-400">
            💡 Tip: Review your wrong cards to improve mastery!
          </p>
        )}
      </div>
    </div>
  );
}

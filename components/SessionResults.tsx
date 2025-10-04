'use client';

import { Flashcard, CardResult } from '@/lib/types';
import CorgiMascot from './CorgiMascot';

interface SessionResultsProps {
  totalCards: number;
  correctCards: number;
  wrongCards: number;
  wrongCardDetails: { flashcard: Flashcard; result: CardResult }[];
  onRestudyWrong: () => void;
  onFinish: () => void;
}

export default function SessionResults({
  totalCards,
  correctCards,
  wrongCards,
  wrongCardDetails,
  onRestudyWrong,
  onFinish,
}: SessionResultsProps) {
  const accuracy = totalCards > 0 ? (correctCards / totalCards) * 100 : 0;

  const getEncouragementMessage = () => {
    if (accuracy === 100) {
      return "Perfect score! You're a superstar! 🌟🐶";
    } else if (accuracy >= 80) {
      return "Pawsome job, you're on fire! 🔥🐶";
    } else if (accuracy >= 60) {
      return "Great effort! Keep it up! 💪🐶";
    } else if (accuracy >= 40) {
      return "Good try! Practice makes perfect! 📚🐶";
    } else {
      return "Don't worry, I'll help you fetch those answers next time! 🐕💙";
    }
  };

  const getCorgiExpression = () => {
    if (accuracy >= 80) return '😊';
    if (accuracy >= 60) return '🙂';
    if (accuracy >= 40) return '😐';
    return '😔';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 mb-6 border-4 border-primary-300 dark:border-teal-700">
        <div className="text-center mb-8">
          <CorgiMascot size={120} className="mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 dark:text-slate-100 mb-3 font-display">
            Study Session Complete!
          </h2>
          <p className="text-xl text-primary-600 dark:text-teal-400 font-medium">
            {getEncouragementMessage()}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center border-2 border-blue-200 dark:border-blue-700">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalCards}
            </div>
            <div className="text-gray-700 dark:text-slate-300 font-medium">Total Cards</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center border-2 border-green-200 dark:border-green-700">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {correctCards}
            </div>
            <div className="text-gray-700 dark:text-slate-300 font-medium">✅ Correct</div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center border-2 border-red-200 dark:border-red-700">
            <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
              {wrongCards}
            </div>
            <div className="text-gray-700 dark:text-slate-300 font-medium">❌ Wrong</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 rounded-xl p-6 text-center mb-6 border dark:border-teal-700">
          <div className="text-5xl font-bold text-primary-700 dark:text-teal-300 mb-2">
            {accuracy.toFixed(0)}%
          </div>
          <div className="text-gray-700 dark:text-slate-300 font-medium text-lg">
            Accuracy Rate
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onFinish}
            className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 px-8 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium shadow-md"
          >
            Back to Study Set
          </button>
          {wrongCards > 0 && (
            <button
              onClick={onRestudyWrong}
              className="bg-primary-500 dark:bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium shadow-md"
            >
              📚 Restudy Wrong Cards ({wrongCards})
            </button>
          )}
        </div>
      </div>

      {wrongCards > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border-2 border-red-200 dark:border-red-700">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span>❌</span>
            <span>Cards to Review ({wrongCards})</span>
          </h3>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            Here are the cards you got wrong. Review them and try again!
          </p>
          <div className="space-y-4">
            {wrongCardDetails.map(({ flashcard }) => (
              <div
                key={flashcard.id}
                className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700"
              >
                <div className="font-semibold text-gray-800 dark:text-slate-100 mb-2">
                  Q: {flashcard.question}
                </div>
                <div className="text-gray-700 dark:text-slate-300 pl-4 border-l-4 border-red-400 dark:border-red-600">
                  A: {flashcard.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


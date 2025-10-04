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

interface MultipleChoiceOption {
  text: string;
  isCorrect: boolean;
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
  const [options, setOptions] = useState<MultipleChoiceOption[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    generateOptions();
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [card.id]);

  const generateOptions = () => {
    const correctAnswer = card.answer;
    
    const otherCards = allFlashcards.filter(c => c.id !== card.id);
    
    if (otherCards.length === 0) {
      setOptions([{ text: correctAnswer, isCorrect: true }]);
      return;
    }
    
    const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5);
    
    const numDistractors = Math.min(3, otherCards.length);
    const distractors = shuffledOthers.slice(0, numDistractors).map(c => c.answer);
    
    const allOptions: MultipleChoiceOption[] = [
      { text: correctAnswer, isCorrect: true },
      ...distractors.map(d => ({ text: d, isCorrect: false })),
    ];
    
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    setOptions(shuffledOptions);
  };

  const handleOptionClick = (option: MultipleChoiceOption) => {
    if (showFeedback) return;
    
    setSelectedAnswer(option.text);
    setIsCorrect(option.isCorrect);
    setShowFeedback(true);
    
    setTimeout(() => {
      onAnswer(option.isCorrect);
      setShowFeedback(false);
      setSelectedAnswer(null);
    }, 1800);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-3xl mx-auto pt-8 pb-4">
        <button
          onClick={onComplete}
          className="text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-teal-300 font-medium mb-4 flex items-center gap-2 transition-colors"
        >
          <span>←</span>
          <span>Back to Study Set</span>
        </button>
      </div>
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {masteredCount} of {totalCards} mastered
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
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

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-12 mb-6 border-2 border-primary-200 dark:border-slate-700">
          <div className="mb-6">
            <span className="text-sm text-primary-600 dark:text-teal-300 font-semibold uppercase tracking-wide">
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
          
          <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100 mb-8 leading-relaxed">
            {card.question}
          </p>

          <div className="space-y-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option.text;
              const showAsCorrect = showFeedback && option.isCorrect;
              const showAsWrong = showFeedback && isSelected && !option.isCorrect;
              
              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all font-medium text-lg
                    ${showFeedback ? 'cursor-default' : 'cursor-pointer hover:border-primary-400 dark:hover:border-teal-500 hover:bg-primary-50 dark:hover:bg-slate-700'}
                    ${showAsCorrect ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600' : ''}
                    ${showAsWrong ? 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-600' : ''}
                    ${!showFeedback ? 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600' : ''}
                    ${showFeedback && !showAsCorrect && !showAsWrong ? 'opacity-50 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 dark:text-slate-100 pr-4">{option.text}</span>
                    {showAsCorrect && <span className="text-2xl">✅</span>}
                    {showAsWrong && <span className="text-2xl">❌</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className="mt-6 animate-fadeIn">
              <div
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                  <div>
                    <span
                      className={`font-bold text-lg ${
                        isCorrect
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}
                    >
                      {isCorrect ? 'Correct!' : 'Not quite'}
                    </span>
                    {isCorrect && progress.correctStreak + 1 >= 2 && !progress.mastered && (
                      <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                        🎉 You&apos;re mastering this card!
                      </p>
                    )}
                    {!isCorrect && (
                      <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                        Correct answer: <span className="font-semibold">{card.answer}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CorgiMascot size={50} />
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {getEncouragementMessage()}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500">
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

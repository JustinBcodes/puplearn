'use client';

import { useState } from 'react';

interface FlashcardFormProps {
  onSubmit: (question: string, answer: string) => void;
  initialQuestion?: string;
  initialAnswer?: string;
  buttonText?: string;
  onCancel?: () => void;
}

export default function FlashcardForm({
  onSubmit,
  initialQuestion = '',
  initialAnswer = '',
  buttonText = 'Add Card',
  onCancel,
}: FlashcardFormProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      onSubmit(question, answer);
      if (!onCancel) {
        setQuestion('');
        setAnswer('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-4">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Question / Term
        </label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question or term..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Answer
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the answer..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
          required
        />
      </div>
      
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-primary-500 dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          {buttonText}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

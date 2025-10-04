'use client';

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Flashcard } from '@/lib/types';
import FlashcardForm from './FlashcardForm';

interface FlashcardItemProps {
  card: Flashcard;
  onDelete: (id: string) => void;
  onUpdate: (id: string, question: string, answer: string) => void;
}

function FlashcardItem({ card, onDelete, onUpdate }: FlashcardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdate = (question: string, answer: string) => {
    onUpdate(card.id, question, answer);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border-2 border-primary-300 dark:border-teal-500 rounded-xl p-4 bg-white dark:bg-slate-800">
        <FlashcardForm
          onSubmit={handleUpdate}
          initialQuestion={card.question}
          initialAnswer={card.answer}
          buttonText="Save Changes"
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-slate-700"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-2">
            {card.question}
          </h3>
          {isExpanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-600 dark:text-slate-400 mt-2 pl-4 border-l-4 border-primary-300 dark:border-teal-500"
            >
              {card.answer}
            </motion.p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 dark:text-teal-400 hover:text-primary-700 dark:hover:text-teal-300 px-3 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            aria-label={isExpanded ? 'Hide answer' : 'Show answer'}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 dark:text-teal-400 hover:text-blue-700 dark:hover:text-teal-300 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            aria-label="Edit flashcard"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this card?')) {
                onDelete(card.id);
              }
            }}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            aria-label="Delete flashcard"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(FlashcardItem, (prevProps, nextProps) => {
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.question === nextProps.card.question &&
    prevProps.card.answer === nextProps.card.answer
  );
});

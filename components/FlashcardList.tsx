'use client';

import { Flashcard } from '@/lib/types';
import FlashcardItem from './FlashcardItem';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardListProps {
  cards: Flashcard[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, question: string, answer: string) => void;
}

export default function FlashcardList({ cards, onDelete, onUpdate }: FlashcardListProps) {
  if (cards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700"
      >
        <p className="text-gray-500 dark:text-slate-400 text-lg">
          No flashcards yet. Create your first one above!
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">
        Flashcards ({cards.length})
      </h2>
      
      {/* Use simple list for now - virtualization adds complexity for editing inline */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
            >
              <FlashcardItem
                card={card}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

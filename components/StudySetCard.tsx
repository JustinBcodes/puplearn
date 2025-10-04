'use client';

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface StudySet {
  id: string;
  title: string;
  description?: string | null;
  flashcardCount: number;
  createdAt: string;
}

interface StudySetCardProps {
  studySet: StudySet;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string, description: string) => void;
}

function StudySetCard({ studySet, onDelete, onUpdate }: StudySetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(studySet.title);
  const [description, setDescription] = useState(studySet.description || '');

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(studySet.id, title, description);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(studySet.title);
    setDescription(studySet.description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border-2 border-primary-300 dark:border-teal-500">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Study set title"
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-teal-500 focus:border-transparent outline-none mb-3 placeholder:text-gray-400 dark:placeholder:text-slate-500"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-teal-500 focus:border-transparent outline-none resize-none mb-3 placeholder:text-gray-400 dark:placeholder:text-slate-500"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary-500 dark:bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-slate-700 group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1">
            {studySet.title}
          </h3>
          {studySet.description && (
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              {studySet.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 dark:text-teal-400 hover:text-blue-700 dark:hover:text-teal-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${studySet.title}"? This will delete all flashcards in this set.`)) {
                onDelete(studySet.id);
              }
            }}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
        <span className="text-gray-500 dark:text-slate-400 text-sm">
          {studySet.flashcardCount} {studySet.flashcardCount === 1 ? 'card' : 'cards'}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/study-sets/${studySet.id}`}
            className="text-primary-600 dark:text-teal-400 hover:text-primary-700 dark:hover:text-teal-300 font-medium text-sm px-4 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors"
          >
            Manage Cards
          </Link>
          {studySet.flashcardCount > 0 && (
            <Link
              href={`/study-sets/${studySet.id}/study`}
              className="bg-primary-500 dark:bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium text-sm"
            >
              Study
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(StudySetCard, (prevProps, nextProps) => {
  return (
    prevProps.studySet.id === nextProps.studySet.id &&
    prevProps.studySet.title === nextProps.studySet.title &&
    prevProps.studySet.description === nextProps.studySet.description &&
    prevProps.studySet.flashcardCount === nextProps.studySet.flashcardCount
  );
});


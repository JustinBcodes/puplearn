'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import CorgiMascot from '@/components/CorgiMascot';
import FlashcardForm from '@/components/FlashcardForm';
import FlashcardList from '@/components/FlashcardList';
import BulkImportModal from '@/components/BulkImportModal';
import { StudySet, Flashcard } from '@/lib/types';
import { ParsedFlashcard } from '@/lib/flashcardParser';

export default function StudySetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportSuccess, setBulkImportSuccess] = useState<number | null>(null);
  const [isStudyMenuOpen, setIsStudyMenuOpen] = useState(false);
  const studyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studyMenuRef.current && !studyMenuRef.current.contains(event.target as Node)) {
        setIsStudyMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchStudySet();
    }
  }, [status, id]);

  const fetchStudySet = async () => {
    try {
      const response = await fetch(`/api/study-sets/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStudySet(data);
        setFlashcards(data.flashcards || []);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching study set:', error);
      }
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFlashcard = async (question: string, answer: string) => {
    try {
      const response = await fetch(`/api/study-sets/${id}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });

      if (response.ok) {
        fetchStudySet();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding flashcard:', error);
      }
      alert('Failed to add flashcard. Please try again.');
    }
  };

  const handleUpdateFlashcard = async (cardId: string, question: string, answer: string) => {
    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });

      if (response.ok) {
        fetchStudySet();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating flashcard:', error);
      }
      alert('Failed to update flashcard. Please try again.');
    }
  };

  const handleDeleteFlashcard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFlashcards(flashcards.filter((card) => card.id !== cardId));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting flashcard:', error);
      }
      alert('Failed to delete flashcard. Please try again.');
    }
  };

  const handleBulkImport = async (parsedCards: ParsedFlashcard[]) => {
    try {
      const response = await fetch(`/api/study-sets/${id}/flashcards/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcards: parsedCards }),
      });

      if (response.ok) {
        const data = await response.json();
        setBulkImportSuccess(data.count);
        setTimeout(() => setBulkImportSuccess(null), 5000);
        fetchStudySet();
      } else {
        throw new Error('Failed to import flashcards');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error importing flashcards:', error);
      }
      throw error;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CorgiMascot size={120} className="mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading study set...</p>
        </div>
      </div>
    );
  }

  if (!session || !studySet) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex items-start gap-4">
          <CorgiMascot size={80} />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {studySet.title}
            </h1>
            {studySet.description && (
              <p className="text-gray-600 text-lg">
                {studySet.description}
              </p>
            )}
          </div>
          {flashcards.length > 0 && (
            <div className="relative" ref={studyMenuRef}>
              <button 
                onClick={() => setIsStudyMenuOpen(!isStudyMenuOpen)}
                className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>📚</span>
                <span>Study</span>
                <span className="text-sm">{isStudyMenuOpen ? '▲' : '▼'}</span>
              </button>
              {isStudyMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10 animate-fadeIn">
                  <Link
                    href={`/study-sets/${id}/study`}
                    className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📖</span>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-100">Normal Study</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Flip cards at your pace</div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    href={`/study-sets/${id}/study?mode=focus`}
                    className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎯</span>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-100">Focus Mode</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Distraction-free study</div>
                      </div>
                    </div>
                  </Link>
                  <Link
                    href={`/study-sets/${id}/learn`}
                    className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors last:rounded-b-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🧠</span>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-100">Learn Mode</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Adaptive multiple choice</div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {bulkImportSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
          <div className="flex items-center gap-3">
            <CorgiMascot size={50} />
            <p className="text-green-800 font-medium">
              Woof! Successfully imported {bulkImportSuccess} flashcard
              {bulkImportSuccess !== 1 ? 's' : ''}! 🐶🎉
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add Flashcards</h2>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <span>📋</span>
            <span>Bulk Import</span>
          </button>
        </div>
        <FlashcardForm onSubmit={handleAddFlashcard} />
      </div>

      <FlashcardList
        cards={flashcards}
        onDelete={handleDeleteFlashcard}
        onUpdate={handleUpdateFlashcard}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
      />
    </div>
  );
}


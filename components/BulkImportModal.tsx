'use client';

import { useState } from 'react';
import { parseFlashcards, ParsedFlashcard } from '@/lib/flashcardParser';
import CorgiMascot from './CorgiMascot';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (flashcards: ParsedFlashcard[]) => Promise<void>;
}

export default function BulkImportModal({
  isOpen,
  onClose,
  onImport,
}: BulkImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [parsedCards, setParsedCards] = useState<ParsedFlashcard[]>([]);
  const [error, setError] = useState('');
  const [detectedFormat, setDetectedFormat] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleParse = () => {
    const result = parseFlashcards(rawText);

    if (result.success) {
      setParsedCards(result.flashcards);
      setDetectedFormat(result.detectedFormat || '');
      setError('');
      setShowPreview(true);
    } else {
      setError(result.error || 'Failed to parse flashcards');
      setParsedCards([]);
      setShowPreview(false);
    }
  };

  const handleUpdateCard = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...parsedCards];
    updated[index][field] = value;
    setParsedCards(updated);
  };

  const handleRemoveCard = (index: number) => {
    setParsedCards(parsedCards.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (parsedCards.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(parsedCards);
      handleClose();
    } catch (err) {
      setError('Failed to import flashcards. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setRawText('');
    setParsedCards([]);
    setError('');
    setDetectedFormat('');
    setShowPreview(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CorgiMascot size={60} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                Bulk Import Flashcards
              </h2>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Paste your Q&A text and I&apos;ll fetch the flashcards for you! 🐶
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-2xl"
          >
            ×
          </button>
        </div>

        {!showPreview ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Paste Your Text
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your flashcard content here. Supported formats:&#10;&#10;Q: What is the capital of France?&#10;A: Paris&#10;&#10;What is 2+2? | 4&#10;&#10;Who wrote Hamlet? - Shakespeare&#10;&#10;1. Largest planet? - Jupiter"
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                Supports: Q:/A:, pipe (|), dash (-), colon (:), and numbered formats
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm whitespace-pre-line">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleParse}
                disabled={!rawText.trim()}
                className="flex-1 bg-primary-500 dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Parse Flashcards
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-center gap-3">
                <CorgiMascot size={50} />
                <div>
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Woof! I just fetched {parsedCards.length} flashcard
                    {parsedCards.length !== 1 ? 's' : ''} from that text! 🐶
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Detected format: {detectedFormat}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-3">
                Preview & Edit ({parsedCards.length} cards)
              </h3>
              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-slate-300 w-5">#</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-slate-300">Question</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-slate-300">Answer</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-slate-300 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {parsedCards.map((card, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{index + 1}</td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={card.question}
                            onChange={(e) =>
                              handleUpdateCard(index, 'question', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded focus:ring-2 focus:ring-primary-500 dark:focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={card.answer}
                            onChange={(e) =>
                              handleUpdateCard(index, 'answer', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded focus:ring-2 focus:ring-primary-500 dark:focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveCard(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={parsedCards.length === 0 || isImporting}
                className="flex-1 bg-primary-500 dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting
                  ? 'Creating Flashcards...'
                  : `Create ${parsedCards.length} Flashcard${parsedCards.length !== 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                disabled={isImporting}
                className="px-6 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={handleClose}
                disabled={isImporting}
                className="px-6 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


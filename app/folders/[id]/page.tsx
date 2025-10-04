'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import CorgiMascot from '@/components/CorgiMascot';
import StudySetCard from '@/components/StudySetCard';
import CreateStudySetForm from '@/components/CreateStudySetForm';
import { Folder, StudySet } from '@/lib/types';
import { FolderIcon, Plus, ChevronRight } from 'lucide-react';

interface FolderWithDetails extends Folder {
  studySets: Array<StudySet & { _count?: { flashcards: number } }>;
  children: Folder[];
  parent?: Folder | null;
}

export default function FolderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [folder, setFolder] = useState<FolderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isCreateFolderPromptOpen, setIsCreateFolderPromptOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchFolder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, id]);

  const fetchFolder = async () => {
    try {
      const response = await fetch(`/api/folders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFolder(data);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching folder:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudySet = async (title: string, description: string) => {
    try {
      const response = await fetch('/api/study-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, folderId: id }),
      });

      if (response.ok) {
        fetchFolder();
      }
    } catch (error) {
      console.error('Error creating study set:', error);
    }
  };

  const handleDeleteStudySet = async (setId: string) => {
    try {
      const response = await fetch(`/api/study-sets/${setId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFolder();
      }
    } catch (error) {
      console.error('Error deleting study set:', error);
    }
  };

  const handleUpdateStudySet = async (setId: string, title: string, description: string) => {
    try {
      const response = await fetch(`/api/study-sets/${setId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        fetchFolder();
      }
    } catch (error) {
      console.error('Error updating study set:', error);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (!name || name.trim() === '') return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), parentId: id }),
      });

      if (response.ok) {
        fetchFolder();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CorgiMascot size={120} className="mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading folder...</p>
        </div>
      </div>
    );
  }

  if (!session || !folder) {
    return null;
  }

  const studySetsWithCount = folder.studySets.map((set) => ({
    ...set,
    flashcardCount: set._count?.flashcards || 0,
    createdAt: new Date(set.createdAt).toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400">
          Home
        </Link>
        <ChevronRight size={16} />
        {folder.parent && (
          <>
            <Link href={`/folders/${folder.parent.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
              {folder.parent.name}
            </Link>
            <ChevronRight size={16} />
          </>
        )}
        <span className="text-gray-800 dark:text-gray-200 font-medium">{folder.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
          <FolderIcon size={48} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {folder.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {folder.studySets.length} study set{folder.studySets.length !== 1 ? 's' : ''} •{' '}
            {folder.children.length} subfolder{folder.children.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateFolder}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <FolderIcon size={20} />
            New Folder
          </button>
          <button
            onClick={() => setIsCreateFormOpen(true)}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Plus size={20} />
            New Study Set
          </button>
        </div>
      </div>

      {/* Subfolders */}
      {folder.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Subfolders</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {folder.children.map((subfolder) => (
              <Link
                key={subfolder.id}
                href={`/folders/${subfolder.id}`}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <FolderIcon size={24} className="text-primary-600 dark:text-primary-400" />
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{subfolder.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Study Sets */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Study Sets</h2>
        {studySetsWithCount.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <CorgiMascot size={120} className="mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              No Study Sets in This Folder
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first study set in this folder to get started!
            </p>
            <button
              onClick={() => setIsCreateFormOpen(true)}
              className="bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-md inline-block"
            >
              Create Study Set
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {studySetsWithCount.map((studySet) => (
              <StudySetCard
                key={studySet.id}
                studySet={studySet}
                onDelete={handleDeleteStudySet}
                onUpdate={handleUpdateStudySet}
              />
            ))}
          </div>
        )}
      </div>

      <CreateStudySetForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateStudySet}
      />
    </div>
  );
}


'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import CorgiMascot from '@/components/CorgiMascot';
import StudySetCard from '@/components/StudySetCard';
import CreateStudySetForm from '@/components/CreateStudySetForm';
import { useSidebar } from '@/contexts/SidebarContext';

interface StudySet {
  id: string;
  title: string;
  description?: string | null;
  flashcardCount: number;
  createdAt: string;
  isFavorite: boolean;
  lastAccessed?: string | null;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'all';
  const { setActiveItem } = useSidebar();
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStudySets();
    }
  }, [status]);

  useEffect(() => {
    // Set active sidebar item based on view
    if (view === 'favorites') {
      setActiveItem(null, 'favorites');
    } else if (view === 'recent') {
      setActiveItem(null, 'recent');
    } else if (view === 'all') {
      setActiveItem(null, 'all');
    } else {
      setActiveItem(null, 'home');
    }
  }, [view, setActiveItem]);

  const fetchStudySets = async () => {
    try {
      const response = await fetch('/api/study-sets');
      if (response.ok) {
        const data = await response.json();
        setStudySets(data);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching study sets:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudySet = async (title: string, description: string) => {
    try {
      const response = await fetch('/api/study-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        fetchStudySets();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating study set:', error);
      }
      alert('Failed to create study set. Please try again.');
    }
  };

  const handleDeleteStudySet = async (id: string) => {
    try {
      const response = await fetch(`/api/study-sets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStudySets(studySets.filter((set) => set.id !== id));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting study set:', error);
      }
      alert('Failed to delete study set. Please try again.');
    }
  };

  const handleUpdateStudySet = async (id: string, title: string, description: string) => {
    try {
      const response = await fetch(`/api/study-sets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        fetchStudySets();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating study set:', error);
      }
      alert('Failed to update study set. Please try again.');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CorgiMascot size={120} className="mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-slate-400">Loading your study sets...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Filter study sets based on view
  let filteredSets = studySets;
  let viewTitle = 'All Study Sets';
  let viewDescription = 'All your study sets in one place';

  if (view === 'favorites') {
    filteredSets = studySets.filter((set) => set.isFavorite);
    viewTitle = 'Favorite Study Sets';
    viewDescription = 'Your starred study sets';
  } else if (view === 'recent') {
    filteredSets = studySets
      .filter((set) => set.lastAccessed)
      .sort((a, b) => {
        const aTime = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
        const bTime = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10);
    viewTitle = 'Recently Accessed';
    viewDescription = 'Your recently viewed study sets';
  } else if (view === 'all') {
    viewTitle = 'All Study Sets';
    viewDescription = 'All your study sets in one place';
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <CorgiMascot size={100} />
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-slate-100 mb-2">
            {view === 'all' || !view ? `Welcome back, ${session.user?.name || 'Learner'}!` : viewTitle}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-lg">
            {view === 'all' || !view ? "Ready to study? Let's make learning fun!" : viewDescription}
          </p>
        </div>
        <button
          onClick={() => setIsCreateFormOpen(true)}
          className="bg-primary-500 dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          + New Study Set
        </button>
      </div>

      {filteredSets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
          <CorgiMascot size={120} className="mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-3">
            {view === 'favorites' ? 'No Favorite Study Sets' : view === 'recent' ? 'No Recent Study Sets' : 'No Study Sets Yet'}
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {view === 'favorites'
              ? 'Star your favorite study sets to see them here!'
              : view === 'recent'
              ? 'Start studying to see your recent sets here!'
              : 'Create your first study set to get started on your learning journey!'}
          </p>
          {(!view || view === 'all') && (
            <button
              onClick={() => setIsCreateFormOpen(true)}
              className="bg-primary-500 dark:bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium shadow-md inline-block"
            >
              Create Your First Study Set
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSets.map((studySet) => (
            <StudySetCard
              key={studySet.id}
              studySet={studySet}
              onDelete={handleDeleteStudySet}
              onUpdate={handleUpdateStudySet}
            />
          ))}
        </div>
      )}

      <CreateStudySetForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateStudySet}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CorgiMascot size={120} className="mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}


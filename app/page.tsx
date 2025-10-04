'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CorgiMascot from '@/components/CorgiMascot';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CorgiMascot size={120} className="mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-center py-16">
      <CorgiMascot size={150} className="mx-auto mb-8" />
      
      <h1 className="text-5xl font-bold text-gray-800 mb-4 font-display">
        Welcome to PupLearn!
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Your friendly corgi companion is here to help you master any subject with 
        interactive flashcards and study sets.
      </p>

      <div className="flex gap-4 justify-center mb-12">
        <Link
          href="/signup"
          className="bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg hover:shadow-xl text-lg"
        >
          Get Started Free
        </Link>
        <Link
          href="/login"
          className="bg-white text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md border border-gray-200 text-lg"
        >
          Sign In
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Create Study Sets</h3>
          <p className="text-gray-600">
            Organize your flashcards into study sets for different subjects
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="text-4xl mb-3">🔄</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Interactive Learning</h3>
          <p className="text-gray-600">
            Flip cards and navigate with keyboard shortcuts for efficient studying
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="text-4xl mb-3">🐕</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Corgi Motivation</h3>
          <p className="text-gray-600">
            Get encouraging messages from your study buddy as you learn
          </p>
        </div>
      </div>
    </div>
  );
}

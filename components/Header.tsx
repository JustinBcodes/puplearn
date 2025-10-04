'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu } from 'lucide-react';
import CorgiMascot from './CorgiMascot';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';

interface HeaderProps {
  showSidebar?: boolean;
}

export default function Header({ showSidebar = false }: HeaderProps) {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-white dark:bg-slate-900 shadow-md border-b dark:border-slate-700 transition-colors shrink-0" role="banner">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {showSidebar && (
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-700 dark:text-teal-300"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
          )}
          
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <CorgiMascot size={50} />
            <h1 className="text-3xl font-bold text-primary-600 dark:text-teal-300 font-display">
              PupLearn
            </h1>
          </Link>
        </div>
        
        <nav className="flex gap-4 items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {status === 'loading' ? (
            <div className="text-gray-500 dark:text-slate-400">Loading...</div>
          ) : session ? (
            <>
              <span className="text-gray-700 dark:text-slate-200 hidden sm:inline">
                {session.user?.name || session.user?.email}
              </span>
              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-teal-300 hover:text-primary-600 dark:hover:text-teal-400 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 dark:text-teal-300 hover:text-primary-600 dark:hover:text-teal-400 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-primary-500 dark:bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-teal-500 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

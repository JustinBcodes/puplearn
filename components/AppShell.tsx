'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { useSidebar } from '@/contexts/SidebarContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isOpen, toggleSidebar } = useSidebar();

  // Don't show sidebar on login, signup, or home page
  const showSidebar = session && pathname !== '/' && pathname !== '/login' && pathname !== '/signup';

  // Check if we're in focus mode (no sidebar, no header extras)
  const isFocusMode = pathname.includes('/study') && pathname.includes('mode=focus');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop: always visible in flex, Mobile: drawer */}
      {showSidebar && !isFocusMode && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>
          
          {/* Mobile Drawer Overlay */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-0 bg-black/50 z-40"
                onClick={toggleSidebar}
              />
            )}
          </AnimatePresence>
          
          {/* Mobile Drawer */}
          <motion.div
            initial={false}
            animate={{ x: isOpen ? 0 : '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden fixed left-0 top-0 h-full z-50"
          >
            <Sidebar />
          </motion.div>
        </>
      )}
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - only spans main content area */}
        <Header showSidebar={showSidebar && !isFocusMode} />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}


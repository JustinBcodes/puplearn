'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  width: number;
  expandedFolders: Set<string>;
  activeItem: string | null;
  activeItemType: 'folder' | 'studyset' | 'home' | 'all' | 'recent' | 'favorites' | null;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
  setWidth: (width: number) => void;
  toggleFolder: (folderId: string) => void;
  expandFolder: (folderId: string) => void;
  collapseFolder: (folderId: string) => void;
  setActiveItem: (id: string | null, type: SidebarContextType['activeItemType']) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidthState] = useState(280);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItemState] = useState<string | null>(null);
  const [activeItemType, setActiveItemType] = useState<SidebarContextType['activeItemType']>(null);

  // Load persisted state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('sidebarWidth');
      const savedCollapsed = localStorage.getItem('sidebarCollapsed');
      const savedExpanded = localStorage.getItem('expandedFolders');

      if (savedWidth) {
        setWidthState(parseInt(savedWidth, 10));
      }
      if (savedCollapsed) {
        setIsCollapsed(savedCollapsed === 'true');
      }
      if (savedExpanded) {
        try {
          const parsed = JSON.parse(savedExpanded);
          setExpandedFolders(new Set(parsed));
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarWidth', width.toString());
    }
  }, [width]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('expandedFolders', JSON.stringify(Array.from(expandedFolders)));
    }
  }, [expandedFolders]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const setWidth = (newWidth: number) => {
    // Clamp width between 200 and 400
    const clampedWidth = Math.max(200, Math.min(400, newWidth));
    setWidthState(clampedWidth);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const expandFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.add(folderId);
      return next;
    });
  };

  const collapseFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.delete(folderId);
      return next;
    });
  };

  const setActiveItem = (id: string | null, type: SidebarContextType['activeItemType']) => {
    setActiveItemState(id);
    setActiveItemType(type);
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        width,
        expandedFolders,
        activeItem,
        activeItemType,
        toggleSidebar,
        toggleCollapsed,
        setWidth,
        toggleFolder,
        expandFolder,
        collapseFolder,
        setActiveItem,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}


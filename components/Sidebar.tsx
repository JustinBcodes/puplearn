'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { Folder, StudySet } from '@/lib/types';
import {
  ChevronRight,
  ChevronDown,
  FolderIcon,
  FileText,
  Home,
  Library,
  Clock,
  Star,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Move,
  PanelLeftClose,
  PanelLeft,
  StarOff,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface FolderWithSets extends Folder {
  studySets: Array<StudySet & { _count?: { flashcards: number } }>;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const {
    isCollapsed,
    isOpen,
    width,
    expandedFolders,
    activeItem,
    activeItemType,
    toggleCollapsed,
    toggleSidebar,
    setWidth,
    toggleFolder,
    setActiveItem,
  } = useSidebar();

  const pathname = usePathname();
  const router = useRouter();
  const [folders, setFolders] = useState<FolderWithSets[]>([]);
  const [unsortedSets, setUnsortedSets] = useState<Array<StudySet & { _count?: { flashcards: number } }>>([]);
  const [recentSets, setRecentSets] = useState<Array<StudySet & { _count?: { flashcards: number } }>>([]);
  const [favoriteSets, setFavoriteSets] = useState<Array<StudySet & { _count?: { flashcards: number } }>>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: FolderWithSets | StudySet;
    type: 'folder' | 'studyset';
  } | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; type: 'folder' | 'studyset' } | null>(null);
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Fetch folders and study sets
  const fetchData = useCallback(async () => {
    try {
      const [foldersRes, setsRes] = await Promise.all([
        fetch('/api/folders'),
        fetch('/api/study-sets'),
      ]);

      if (foldersRes.ok && setsRes.ok) {
        const foldersData = await foldersRes.json();
        const setsData = await setsRes.json();

        // Build folder hierarchy
        const folderMap = new Map<string, FolderWithSets>();
        const rootFolders: FolderWithSets[] = [];

        foldersData.forEach((folder: FolderWithSets) => {
          folderMap.set(folder.id, { ...folder, children: [], studySets: [] });
        });

        foldersData.forEach((folder: FolderWithSets) => {
          const folderNode = folderMap.get(folder.id)!;
          if (folder.parentId) {
            const parent = folderMap.get(folder.parentId);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(folderNode);
            }
          } else {
            rootFolders.push(folderNode);
          }
        });

        // Assign study sets to folders
        const unsorted: Array<StudySet & { _count?: { flashcards: number } }> = [];
        const recent: Array<StudySet & { _count?: { flashcards: number } }> = [];
        const favorites: Array<StudySet & { _count?: { flashcards: number } }> = [];

        setsData.forEach((set: StudySet & { flashcardCount?: number; _count?: { flashcards: number } }) => {
          const setWithCount = {
            ...set,
            _count: { flashcards: set.flashcardCount || set._count?.flashcards || 0 },
          };

          if (set.isFavorite) {
            favorites.push(setWithCount);
          }
          if (set.lastAccessed) {
            recent.push(setWithCount);
          }

          if (set.folderId) {
            const folder = folderMap.get(set.folderId);
            if (folder) {
              folder.studySets = folder.studySets || [];
              folder.studySets.push(setWithCount);
            } else {
              unsorted.push(setWithCount);
            }
          } else {
            unsorted.push(setWithCount);
          }
        });

        // Sort recent by lastAccessed
        recent.sort((a, b) => {
          const aTime = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
          const bTime = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
          return bTime - aTime;
        });

        setFolders(rootFolders);
        setUnsortedSets(unsorted);
        setRecentSets(recent.slice(0, 5));
        setFavoriteSets(favorites);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching sidebar data:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setWidth]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Set active item based on pathname
  useEffect(() => {
    if (pathname === '/dashboard') {
      setActiveItem(null, 'home');
    } else if (pathname.startsWith('/study-sets/')) {
      const setId = pathname.split('/')[2];
      setActiveItem(setId, 'studyset');
    } else if (pathname.startsWith('/folders/')) {
      const folderId = pathname.split('/')[2];
      setActiveItem(folderId, 'folder');
    }
  }, [pathname, setActiveItem]);

  const handleCreateFolder = async (parentId: string | null = null) => {
    const name = prompt('Enter folder name:');
    if (!name || name.trim() === '') return;

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), parentId }),
      });

      if (res.ok) {
        fetchData();
        setNewFolderParentId(null);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating folder:', error);
      }
      alert('Failed to create folder. Please try again.');
    }
  };

  const handleRenameFolder = async (folderId: string, currentName: string) => {
    const name = prompt('Enter new folder name:', currentName);
    if (!name || name.trim() === '' || name === currentName) return;

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error renaming folder:', error);
      }
      alert('Failed to rename folder. Please try again.');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? All nested items will be moved to unsorted.')) {
      return;
    }

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting folder:', error);
      }
      alert('Failed to delete folder. Please try again.');
    }
  };

  const handleToggleFavorite = async (studySetId: string, currentFavorite: boolean) => {
    try {
      const res = await fetch(`/api/study-sets/${studySetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentFavorite }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling favorite:', error);
      }
      alert('Failed to update favorite. Please try again.');
    }
  };

  const handleMoveStudySet = async (studySetId: string, currentFolderId: string | null) => {
    // Simple implementation - show prompt with folder names
    const folderList = ['None (Unsorted)', ...getAllFolderNames(folders)];
    const choice = prompt(
      'Enter folder number to move to:\n' + folderList.map((f, i) => `${i}: ${f}`).join('\n')
    );

    if (choice === null) return;

    const index = parseInt(choice, 10);
    if (isNaN(index) || index < 0 || index >= folderList.length) return;

    const targetFolderId = index === 0 ? null : getAllFolders(folders)[index - 1].id;

    try {
      const res = await fetch(`/api/study-sets/${studySetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: targetFolderId }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error moving study set:', error);
      }
      alert('Failed to move study set. Please try again.');
    }
  };

  const getAllFolders = (folderList: FolderWithSets[]): FolderWithSets[] => {
    let result: FolderWithSets[] = [];
    folderList.forEach((f) => {
      result.push(f);
      if (f.children && f.children.length > 0) {
        result = result.concat(getAllFolders(f.children as FolderWithSets[]));
      }
    });
    return result;
  };

  const getAllFolderNames = (folderList: FolderWithSets[]): string[] => {
    return getAllFolders(folderList).map((f) => f.name);
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    item: FolderWithSets | StudySet,
    type: 'folder' | 'studyset'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item, type });
  };

  const renderContextMenu = () => {
    if (!contextMenu) return null;

    const { x, y, item, type } = contextMenu;

    return (
      <div
        className="fixed bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-1 z-50"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'folder' ? (
          <>
            <button
              onClick={() => {
                handleRenameFolder((item as FolderWithSets).id, (item as FolderWithSets).name);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200"
            >
              <Edit2 size={14} />
              Rename
            </button>
            <button
              onClick={() => {
                setNewFolderParentId((item as FolderWithSets).id);
                handleCreateFolder((item as FolderWithSets).id);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200"
            >
              <Plus size={14} />
              New Subfolder
            </button>
            <button
              onClick={() => {
                handleDeleteFolder((item as FolderWithSets).id);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                handleToggleFavorite((item as StudySet).id, (item as StudySet).isFavorite);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200"
            >
              {(item as StudySet).isFavorite ? <StarOff size={14} /> : <Star size={14} />}
              {(item as StudySet).isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <button
              onClick={() => {
                handleMoveStudySet((item as StudySet).id, (item as StudySet).folderId || null);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200"
            >
              <Move size={14} />
              Move to Folder
            </button>
          </>
        )}
      </div>
    );
  };

  const handleLinkClick = () => {
    // Close mobile drawer when clicking a link
    if (typeof window !== 'undefined' && window.innerWidth < 768 && isOpen) {
      toggleSidebar();
    }
  };

  const renderStudySet = (set: StudySet & { _count?: { flashcards: number } }, depth: number = 0) => {
    const isActive = activeItemType === 'studyset' && activeItem === set.id;
    const cardCount = set._count?.flashcards || 0;

    return (
      <Link
        key={set.id}
        href={`/study-sets/${set.id}`}
        className={`flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group ${
          isActive ? 'bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-teal-300' : 'text-gray-700 dark:text-slate-200'
        }`}
        style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}
        onContextMenu={(e) => handleContextMenu(e, set, 'studyset')}
        onClick={handleLinkClick}
      >
        <FileText size={16} className={isActive ? 'text-primary-600 dark:text-teal-300' : 'text-gray-500 dark:text-slate-400'} />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate text-sm">{set.title}</span>
            <span className="text-xs text-gray-400 dark:text-slate-500">{cardCount}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleContextMenu(e, set, 'studyset');
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 dark:text-slate-400"
            >
              <MoreVertical size={14} />
            </button>
          </>
        )}
      </Link>
    );
  };

  const renderFolder = (folder: FolderWithSets, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isActive = activeItemType === 'folder' && activeItem === folder.id;
    const hasChildren = (folder.children && folder.children.length > 0) || (folder.studySets && folder.studySets.length > 0);

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group ${
            isActive ? 'bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-teal-300' : 'text-gray-700 dark:text-slate-200'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleFolder(folder.id);
            }
            router.push(`/folders/${folder.id}`);
            handleLinkClick();
          }}
          onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="hover:bg-gray-200 dark:hover:bg-slate-700 rounded p-0.5 text-gray-600 dark:text-slate-300"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <FolderIcon
            size={16}
            className={isActive ? 'text-primary-600 dark:text-teal-300' : 'text-gray-500 dark:text-slate-400'}
          />
          {!isCollapsed && (
            <>
              <span className="flex-1 truncate text-sm">{folder.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, folder, 'folder');
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 dark:text-slate-400"
              >
                <MoreVertical size={14} />
              </button>
            </>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div>
            {folder.children?.map((child) => renderFolder(child as FolderWithSets, depth + 1))}
            {folder.studySets?.map((set) => renderStudySet(set, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const NavItem = ({
    icon: Icon,
    label,
    href,
    count,
    type,
  }: {
    icon: React.ElementType;
    label: string;
    href: string;
    count?: number;
    type: 'home' | 'all' | 'recent' | 'favorites';
  }) => {
    const isActive = activeItemType === type;
    
    // Add query param for non-home views
    let fullHref = href;
    if (type === 'all' || type === 'recent' || type === 'favorites') {
      fullHref = `${href}?view=${type}`;
    }
    
    return (
      <Link
        href={fullHref}
        className={`flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
          isActive ? 'bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-teal-300' : 'text-gray-700 dark:text-slate-200'
        }`}
        onClick={() => {
          setActiveItem(null, type);
          handleLinkClick();
        }}
      >
        <Icon size={18} className={isActive ? 'text-primary-600 dark:text-teal-300' : 'text-gray-500 dark:text-slate-400'} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-medium">{label}</span>
            {count !== undefined && <span className="text-xs text-gray-400 dark:text-slate-500">{count}</span>}
          </>
        )}
      </Link>
    );
  };

  if (isCollapsed) {
    return (
      <aside
        ref={sidebarRef}
        className={`h-full bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-all shrink-0 ${className}`}
        style={{ width: '64px' }}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        <div className="p-3 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={toggleCollapsed}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-700 dark:text-slate-300"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeft size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1">
            <NavItem icon={Home} label="Home" href="/dashboard" type="home" />
            <NavItem icon={Library} label="All" href="/dashboard" type="all" />
            <NavItem icon={Clock} label="Recent" href="/dashboard" type="recent" />
            <NavItem icon={Star} label="Favorites" href="/dashboard" type="favorites" />
          </div>
        </nav>
      </aside>
    );
  }

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`h-full bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-all shrink-0 ${className}`}
        style={{ width: `${width}px` }}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-800 dark:text-slate-100">Navigation</h2>
          <button
            onClick={toggleCollapsed}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-700 dark:text-slate-300"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1 mb-4">
            <NavItem icon={Home} label="Home" href="/dashboard" type="home" />
            <NavItem icon={Library} label="All Flashcards" href="/dashboard" type="all" count={unsortedSets.length + folders.length} />
            <NavItem icon={Clock} label="Recent" href="/dashboard" type="recent" count={recentSets.length} />
            <NavItem icon={Star} label="Favorites" href="/dashboard" type="favorites" count={favoriteSets.length} />
          </div>

          {/* Favorites Section */}
          {favoriteSets.length > 0 && activeItemType === 'favorites' && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Favorites
              </div>
              {favoriteSets.map((set) => renderStudySet(set, 0))}
            </div>
          )}

          {/* Recent Section */}
          {recentSets.length > 0 && activeItemType === 'recent' && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Recent
              </div>
              {recentSets.map((set) => renderStudySet(set, 0))}
            </div>
          )}

          {/* Folders */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Folders
              </div>
              <button
                onClick={() => handleCreateFolder(null)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded transition-colors text-gray-600 dark:text-slate-300"
                title="New folder"
                aria-label="Create new folder"
              >
                <Plus size={14} />
              </button>
            </div>
            {folders.length === 0 && unsortedSets.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                <p className="mb-2">No sets yet!</p>
                <p className="text-xs">Create your first folder or study set</p>
              </div>
            ) : (
              <>
                {folders.map((folder) => renderFolder(folder, 0))}
                {unsortedSets.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mt-2">
                      Unsorted
                    </div>
                    {unsortedSets.map((set) => renderStudySet(set, 0))}
                  </div>
                )}
              </>
            )}
          </div>
        </nav>

        {/* Resize Handle */}
        <div
          ref={resizeHandleRef}
          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-teal-500 dark:hover:bg-teal-400 transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />
      </aside>

      {/* Context Menu */}
      {renderContextMenu()}
    </>
  );
}


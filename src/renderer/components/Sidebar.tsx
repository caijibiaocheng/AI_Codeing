import React from 'react';

interface SidebarProps {
  onOpenSettings: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onToggleTerminal?: () => void;
  isTerminalOpen?: boolean;
  onToggleGit?: () => void;
  showGitPanel?: boolean;
  onToggleSearch?: () => void;
  isSearchOpen?: boolean;
  onToggleComposer?: () => void;
  isComposerOpen?: boolean;
  onToggleExtensions?: () => void;
  isExtensionsOpen?: boolean;
  onToggleAIAssistant?: () => void;
  isAIAssistantOpen?: boolean;
  onToggleTodo?: () => void;
  isTodoOpen?: boolean;
  onToggleGitStash?: () => void;
  isGitStashOpen?: boolean;
  onToggleTools?: () => void;
  isToolsOpen?: boolean;
  onToggleSnippets?: () => void;
  isSnippetsOpen?: boolean;
  onToggleBookmarks?: () => void;
  isBookmarksOpen?: boolean;
  onToggleCodeMetrics?: () => void;
  isCodeMetricsOpen?: boolean;
  onToggleRecentFiles?: () => void;
  isRecentFilesOpen?: boolean;
  onToggleOutline?: () => void;
  isOutlineOpen?: boolean;
  onToggleProblems?: () => void;
  isProblemsOpen?: boolean;
  onToggleTaskQueue?: () => void;
  isTaskQueueOpen?: boolean;
  onToggleSymbolNavigation?: () => void;
  isSymbolNavigationOpen?: boolean;
  onToggleRefactoringTools?: () => void;
  isRefactoringToolsOpen?: boolean;
  onToggleAdvancedSearch?: () => void;
  isAdvancedSearchReplaceOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenSettings, 
  onToggleChat, 
  isChatOpen,
  onToggleTerminal,
  isTerminalOpen = false,
  onToggleGit,
  showGitPanel = false,
  onToggleSearch,
  isSearchOpen = false,
  onToggleComposer,
  isComposerOpen = false,
  onToggleExtensions,
  isExtensionsOpen = false,
  onToggleAIAssistant,
  isAIAssistantOpen = false,
  onToggleTodo,
  isTodoOpen = false,
  onToggleGitStash,
  isGitStashOpen = false,
  onToggleTools,
  isToolsOpen = false,
  onToggleSnippets,
  isSnippetsOpen = false,
  onToggleBookmarks,
  isBookmarksOpen = false,
  onToggleCodeMetrics,
  isCodeMetricsOpen = false,
  onToggleRecentFiles,
  isRecentFilesOpen = false,
  onToggleOutline,
  isOutlineOpen = false,
  onToggleProblems,
  isProblemsOpen = false,
  onToggleTaskQueue,
  isTaskQueueOpen = false,
  onToggleSymbolNavigation,
  isSymbolNavigationOpen = false,
  onToggleRefactoringTools,
  isRefactoringToolsOpen = false,
  onToggleAdvancedSearch,
  isAdvancedSearchReplaceOpen = false
}) => {
  return (
    <div className="sidebar">
      <div 
        className={`sidebar-icon ${isChatOpen ? 'active' : ''}`}
        onClick={onToggleChat}
        title="AI Chat"
      >
        💬
      </div>
      
      {onToggleComposer && (
        <div 
          className={`sidebar-icon ${isComposerOpen ? 'active' : ''}`}
          onClick={onToggleComposer}
          title="AI Composer (Ctrl+Shift+C)"
        >
          ✨
        </div>
      )}
      
      {onToggleAIAssistant && (
        <div 
          className={`sidebar-icon ${isAIAssistantOpen ? 'active' : ''}`}
          onClick={onToggleAIAssistant}
          title="AI Assistant (Ctrl+Shift+A)"
        >
          🤖
        </div>
      )}
      
      {onToggleGit && (
        <div 
          className={`sidebar-icon ${showGitPanel ? 'active' : ''}`}
          onClick={onToggleGit}
          title="Git (Ctrl+Shift+G)"
        >
          🔀
        </div>
      )}
      
      {onToggleSearch && (
        <div 
          className={`sidebar-icon ${isSearchOpen ? 'active' : ''}`}
          onClick={onToggleSearch}
          title="Search (Ctrl+Shift+F)"
        >
          🔍
        </div>
      )}
      
      {onToggleExtensions && (
        <div 
          className={`sidebar-icon ${isExtensionsOpen ? 'active' : ''}`}
          onClick={onToggleExtensions}
          title="Extensions (Ctrl+Shift+X)"
        >
          📦
        </div>
      )}
      
      {onToggleTerminal && (
        <div 
          className={`sidebar-icon ${isTerminalOpen ? 'active' : ''}`}
          onClick={onToggleTerminal}
          title="Terminal (Ctrl+`)"
        >
          ⌨️
        </div>
      )}
      
      {onToggleTodo && (
        <div 
          className={`sidebar-icon ${isTodoOpen ? 'active' : ''}`}
          onClick={onToggleTodo}
          title="TODO Tracker (Ctrl+Shift+T)"
        >
          ✅
        </div>
      )}
      
      {onToggleGitStash && (
        <div 
          className={`sidebar-icon ${isGitStashOpen ? 'active' : ''}`}
          onClick={onToggleGitStash}
          title="Git Stash (Ctrl+Shift+S)"
        >
          📥
        </div>
      )}
      
      {onToggleTools && (
        <div 
          className={`sidebar-icon ${isToolsOpen ? 'active' : ''}`}
          onClick={onToggleTools}
          title="Developer Tools (Ctrl+Shift+U)"
        >
          🛠️
        </div>
      )}
      
      {onToggleSnippets && (
        <div 
          className={`sidebar-icon ${isSnippetsOpen ? 'active' : ''}`}
          onClick={onToggleSnippets}
          title="Code Snippets (Ctrl+Shift+P)"
        >
          📝
        </div>
      )}
      
      {onToggleBookmarks && (
        <div 
          className={`sidebar-icon ${isBookmarksOpen ? 'active' : ''}`}
          onClick={onToggleBookmarks}
          title="Bookmarks (Ctrl+Shift+B)"
        >
          🔖
        </div>
      )}
      
      {onToggleCodeMetrics && (
        <div 
          className={`sidebar-icon ${isCodeMetricsOpen ? 'active' : ''}`}
          onClick={onToggleCodeMetrics}
          title="Code Metrics (Ctrl+Shift+M)"
        >
          📊
        </div>
      )}
      
      {onToggleRecentFiles && (
        <div 
          className={`sidebar-icon ${isRecentFilesOpen ? 'active' : ''}`}
          onClick={onToggleRecentFiles}
          title="Recent Files (Ctrl+Shift+R)"
        >
          🕒
        </div>
      )}
      
      {onToggleOutline && (
        <div 
          className={`sidebar-icon ${isOutlineOpen ? 'active' : ''}`}
          onClick={onToggleOutline}
          title="Outline (Ctrl+Shift+O)"
        >
          🗂️
        </div>
      )}
      
      {onToggleProblems && (
        <div 
          className={`sidebar-icon ${isProblemsOpen ? 'active' : ''}`}
          onClick={onToggleProblems}
          title="Problems (Ctrl+Shift+D)"
        >
          🐛
        </div>
      )}
      
      {onToggleTaskQueue && (
        <div 
          className={`sidebar-icon ${isTaskQueueOpen ? 'active' : ''}`}
          onClick={onToggleTaskQueue}
          title="Task Queue (Ctrl+Shift+Q)"
        >
          📋
        </div>
      )}
      
      {onToggleSymbolNavigation && (
        <div 
          className={`sidebar-icon ${isSymbolNavigationOpen ? 'active' : ''}`}
          onClick={onToggleSymbolNavigation}
          title="Symbol Navigation (Ctrl+Shift+H)"
        >
          🔍
        </div>
      )}
      
      {onToggleRefactoringTools && (
        <div 
          className={`sidebar-icon ${isRefactoringToolsOpen ? 'active' : ''}`}
          onClick={onToggleRefactoringTools}
          title="Refactoring Tools (Ctrl+Alt+R)"
        >
          🔧
        </div>
      )}
      
      {onToggleAdvancedSearch && (
        <div 
          className={`sidebar-icon ${isAdvancedSearchReplaceOpen ? 'active' : ''}`}
          onClick={onToggleAdvancedSearch}
          title="Advanced Search (Ctrl+Shift+\)"
        >
          🔎
        </div>
      )}
      
      <div 
        className="sidebar-icon"
        onClick={onOpenSettings}
        title="Settings"
      >
        ⚙️
      </div>
    </div>
  );
};

export default Sidebar;

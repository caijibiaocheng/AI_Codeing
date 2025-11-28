import React, { useState, useEffect, useCallback } from 'react';
import './BookmarkPanel.css';

interface Bookmark {
  id: string;
  filePath: string;
  line: number;
  label?: string;
  createdAt: number;
}

interface BookmarkPanelProps {
  currentFilePath?: string;
  onNavigateToBookmark?: (filePath: string, line: number) => void;
}

const BookmarkPanel: React.FC<BookmarkPanelProps> = ({
  currentFilePath,
  onNavigateToBookmark
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'current'>('all');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    label: '',
    line: 1
  });

  const loadBookmarks = useCallback(async () => {
    try {
      const result = await window.electronAPI.pmGetBookmarks();
      if (result.success && result.data) {
        setBookmarks(result.data);
      }
    } catch (error) {
      console.error('[BookmarkPanel] Error loading bookmarks:', error);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    if (filterMode === 'current' && currentFilePath) {
      setFilteredBookmarks(bookmarks.filter(b => b.filePath === currentFilePath));
    } else {
      setFilteredBookmarks(bookmarks);
    }
  }, [bookmarks, filterMode, currentFilePath]);

  const handleAddBookmark = async () => {
    if (!currentFilePath) {
      alert('No file is currently open');
      return;
    }

    if (newBookmark.line < 1) {
      alert('Line number must be greater than 0');
      return;
    }

    try {
      const result = await window.electronAPI.pmAddBookmark(
        currentFilePath,
        newBookmark.line,
        newBookmark.label || undefined
      );

      if (result.success) {
        setIsAddingBookmark(false);
        setNewBookmark({ label: '', line: 1 });
        loadBookmarks();
      }
    } catch (error) {
      console.error('[BookmarkPanel] Error adding bookmark:', error);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return;
    }

    try {
      const result = await window.electronAPI.pmDeleteBookmark(id);
      if (result.success) {
        loadBookmarks();
      }
    } catch (error) {
      console.error('[BookmarkPanel] Error deleting bookmark:', error);
    }
  };

  const handleNavigate = (bookmark: Bookmark) => {
    if (onNavigateToBookmark) {
      onNavigateToBookmark(bookmark.filePath, bookmark.line);
    }
  };

  const getFileName = (filePath: string) => {
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1];
  };

  const getRelativePath = (filePath: string) => {
    const parts = filePath.split(/[/\\]/);
    return parts.slice(-3).join('/');
  };

  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    if (!acc[bookmark.filePath]) {
      acc[bookmark.filePath] = [];
    }
    acc[bookmark.filePath].push(bookmark);
    return acc;
  }, {} as Record<string, Bookmark[]>);

  return (
    <div className="bookmark-panel">
      <div className="bookmark-header">
        <h3>🔖 Bookmarks</h3>
        <div className="bookmark-header-actions">
          <button
            className={`btn-filter ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
            title="Show all bookmarks"
          >
            All
          </button>
          <button
            className={`btn-filter ${filterMode === 'current' ? 'active' : ''}`}
            onClick={() => setFilterMode('current')}
            title="Show current file bookmarks"
            disabled={!currentFilePath}
          >
            Current
          </button>
          <button
            className="btn-primary"
            onClick={() => setIsAddingBookmark(true)}
            disabled={!currentFilePath}
            title={!currentFilePath ? 'Open a file first' : 'Add bookmark'}
          >
            + Add
          </button>
        </div>
      </div>

      <div className="bookmark-list">
        {filteredBookmarks.length === 0 ? (
          <div className="empty-state">
            <p>No bookmarks found</p>
            <p className="hint">
              {currentFilePath
                ? 'Add bookmarks to mark important locations in your code'
                : 'Open a file to add bookmarks'}
            </p>
          </div>
        ) : (
          <div className="bookmark-groups">
            {Object.entries(groupedBookmarks).map(([filePath, fileBookmarks]) => (
              <div key={filePath} className="bookmark-group">
                <div className="bookmark-group-header">
                  <span className="file-icon">📄</span>
                  <span className="file-name" title={filePath}>
                    {getFileName(filePath)}
                  </span>
                  <span className="file-path">{getRelativePath(filePath)}</span>
                </div>
                <div className="bookmark-group-items">
                  {fileBookmarks
                    .sort((a, b) => a.line - b.line)
                    .map(bookmark => (
                      <div
                        key={bookmark.id}
                        className="bookmark-item"
                        onClick={() => handleNavigate(bookmark)}
                      >
                        <div className="bookmark-item-content">
                          <span className="bookmark-line">Line {bookmark.line}</span>
                          {bookmark.label && (
                            <span className="bookmark-label">{bookmark.label}</span>
                          )}
                        </div>
                        <button
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBookmark(bookmark.id);
                          }}
                          title="Delete bookmark"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddingBookmark && (
        <div className="modal-overlay" onClick={() => setIsAddingBookmark(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Bookmark</h3>
            <p className="modal-file-info">
              File: {currentFilePath ? getFileName(currentFilePath) : 'None'}
            </p>
            <div className="form-group">
              <label>Line Number *</label>
              <input
                type="number"
                min="1"
                value={newBookmark.line}
                onChange={(e) => setNewBookmark({ ...newBookmark, line: parseInt(e.target.value) || 1 })}
                placeholder="Line number"
              />
            </div>
            <div className="form-group">
              <label>Label (optional)</label>
              <input
                type="text"
                value={newBookmark.label}
                onChange={(e) => setNewBookmark({ ...newBookmark, label: e.target.value })}
                placeholder="e.g., Important function, Bug fix needed"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsAddingBookmark(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddBookmark}>
                Add Bookmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkPanel;

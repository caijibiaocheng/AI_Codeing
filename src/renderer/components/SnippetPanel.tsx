import React, { useState, useEffect, useCallback } from 'react';
import './SnippetPanel.css';

interface CodeSnippet {
  id: string;
  name: string;
  description?: string;
  language: string;
  code: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface SnippetPanelProps {
  onInsertSnippet?: (code: string) => void;
}

const SnippetPanel: React.FC<SnippetPanelProps> = ({ onInsertSnippet }) => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [isAddingSnippet, setIsAddingSnippet] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    name: '',
    description: '',
    language: 'javascript',
    code: '',
    tags: '' as string
  });

  const loadSnippets = useCallback(async () => {
    try {
      const result = searchQuery
        ? await window.electronAPI.pmSearchSnippets(searchQuery)
        : await window.electronAPI.pmGetSnippets();
      
      if (result.success && result.data) {
        setSnippets(result.data);
      }
    } catch (error) {
      console.error('[SnippetPanel] Error loading snippets:', error);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadSnippets();
  }, [loadSnippets]);

  const handleAddSnippet = async () => {
    if (!newSnippet.name || !newSnippet.code) {
      alert('Please provide snippet name and code');
      return;
    }

    try {
      const tags = newSnippet.tags.split(',').map(t => t.trim()).filter(Boolean);
      const result = await window.electronAPI.pmAddSnippet(
        newSnippet.name,
        newSnippet.code,
        newSnippet.language,
        newSnippet.description || undefined,
        tags
      );

      if (result.success) {
        setIsAddingSnippet(false);
        setNewSnippet({
          name: '',
          description: '',
          language: 'javascript',
          code: '',
          tags: ''
        });
        loadSnippets();
      }
    } catch (error) {
      console.error('[SnippetPanel] Error adding snippet:', error);
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      const result = await window.electronAPI.pmDeleteSnippet(id);
      if (result.success) {
        if (selectedSnippet?.id === id) {
          setSelectedSnippet(null);
        }
        loadSnippets();
      }
    } catch (error) {
      console.error('[SnippetPanel] Error deleting snippet:', error);
    }
  };

  const handleInsertSnippet = (snippet: CodeSnippet) => {
    if (onInsertSnippet) {
      onInsertSnippet(snippet.code);
    }
    window.electronAPI.copyToClipboard(snippet.code);
  };

  const handleCopySnippet = (code: string) => {
    window.electronAPI.copyToClipboard(code);
  };

  const filteredSnippets = snippets;

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust',
    'html', 'css', 'sql', 'bash', 'json', 'yaml', 'markdown'
  ];

  return (
    <div className="snippet-panel">
      <div className="snippet-header">
        <h3>📝 Code Snippets</h3>
        <button
          className="btn-primary"
          onClick={() => setIsAddingSnippet(true)}
        >
          + Add Snippet
        </button>
      </div>

      <div className="snippet-search">
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="snippet-content">
        <div className="snippet-list">
          {filteredSnippets.length === 0 ? (
            <div className="empty-state">
              <p>No snippets found</p>
              <p className="hint">Create your first snippet to get started</p>
            </div>
          ) : (
            filteredSnippets.map(snippet => (
              <div
                key={snippet.id}
                className={`snippet-item ${selectedSnippet?.id === snippet.id ? 'selected' : ''}`}
                onClick={() => setSelectedSnippet(snippet)}
              >
                <div className="snippet-item-header">
                  <span className="snippet-name">{snippet.name}</span>
                  <span className="snippet-language">{snippet.language}</span>
                </div>
                {snippet.description && (
                  <div className="snippet-description">{snippet.description}</div>
                )}
                {snippet.tags.length > 0 && (
                  <div className="snippet-tags">
                    {snippet.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {selectedSnippet && (
          <div className="snippet-detail">
            <div className="snippet-detail-header">
              <h4>{selectedSnippet.name}</h4>
              <div className="snippet-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleInsertSnippet(selectedSnippet)}
                  title="Insert into editor"
                >
                  📋 Insert
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleCopySnippet(selectedSnippet.code)}
                  title="Copy to clipboard"
                >
                  📄 Copy
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteSnippet(selectedSnippet.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
            {selectedSnippet.description && (
              <p className="snippet-detail-description">{selectedSnippet.description}</p>
            )}
            <pre className="snippet-code">
              <code>{selectedSnippet.code}</code>
            </pre>
            {selectedSnippet.tags.length > 0 && (
              <div className="snippet-detail-tags">
                {selectedSnippet.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
            <div className="snippet-meta">
              <small>Created: {new Date(selectedSnippet.createdAt).toLocaleString()}</small>
            </div>
          </div>
        )}
      </div>

      {isAddingSnippet && (
        <div className="modal-overlay" onClick={() => setIsAddingSnippet(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Snippet</h3>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={newSnippet.name}
                onChange={(e) => setNewSnippet({ ...newSnippet, name: e.target.value })}
                placeholder="Snippet name"
              />
            </div>
            <div className="form-group">
              <label>Language *</label>
              <select
                value={newSnippet.language}
                onChange={(e) => setNewSnippet({ ...newSnippet, language: e.target.value })}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={newSnippet.description}
                onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div className="form-group">
              <label>Code *</label>
              <textarea
                value={newSnippet.code}
                onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
                placeholder="Paste your code here..."
                rows={10}
              />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={newSnippet.tags}
                onChange={(e) => setNewSnippet({ ...newSnippet, tags: e.target.value })}
                placeholder="e.g., react, hooks, utility"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsAddingSnippet(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddSnippet}>
                Add Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetPanel;

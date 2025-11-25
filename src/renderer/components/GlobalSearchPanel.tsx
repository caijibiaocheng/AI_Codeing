import React, { useState } from 'react';
import './GlobalSearchPanel.css';

interface SearchResult {
  file: string;
  line: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

interface GlobalSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFileOpen: (filePath: string, line?: number) => void;
  rootPath: string;
}

const GlobalSearchPanel: React.FC<GlobalSearchPanelProps> = ({ isOpen, onClose, onFileOpen, rootPath }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [fileFilter, setFileFilter] = useState('');

  const handleSearch = async () => {
    if (!query.trim() || !rootPath) return;

    setIsSearching(true);
    setResults([]);

    try {
      const result = await window.electronAPI.searchInFiles(rootPath, query, {
        useRegex,
        caseSensitive,
        fileFilter: fileFilter || undefined
      });

      if (result.success && result.data) {
        setResults(result.data);
      } else {
        console.error('Search failed:', result.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const highlightMatch = (content: string, matchStart: number, matchEnd: number) => {
    const before = content.substring(0, matchStart);
    const match = content.substring(matchStart, matchEnd);
    const after = content.substring(matchEnd);
    
    return (
      <>
        {before}
        <span className="search-match-highlight">{match}</span>
        {after}
      </>
    );
  };

  const handleResultClick = (result: SearchResult) => {
    onFileOpen(result.file, result.line);
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-panel">
      <div className="global-search-header">
        <h3>Search in Files</h3>
        <button className="search-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="global-search-inputs">
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className="search-btn" 
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? '⏳' : '🔍'}
          </button>
        </div>

        <div className="search-input-group">
          <input
            type="text"
            className="search-filter-input"
            placeholder="File filter (e.g., *.ts, *.js)"
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
          />
        </div>

        <div className="search-options">
          <label>
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            <span>Case Sensitive (Aa)</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
            />
            <span>Use Regex (.*)</span>
          </label>
        </div>
      </div>

      <div className="global-search-results">
        {isSearching ? (
          <div className="search-status">Searching...</div>
        ) : results.length === 0 ? (
          <div className="search-status">
            {query ? 'No results found' : 'Enter a search query and press Enter'}
          </div>
        ) : (
          <>
            <div className="search-result-count">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </div>
            <div className="search-results-list">
              {results.map((result, index) => (
                <div
                  key={`${result.file}-${result.line}-${index}`}
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="search-result-file">
                    📄 {result.file}
                  </div>
                  <div className="search-result-line">
                    <span className="search-result-line-number">Line {result.line}:</span>
                    <code className="search-result-content">
                      {highlightMatch(result.content, result.matchStart, result.matchEnd)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="global-search-footer">
        <span>Enter to search</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
};

export default GlobalSearchPanel;

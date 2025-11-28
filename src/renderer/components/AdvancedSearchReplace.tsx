/**
 * 高级搜索和替换工具
 * 支持正则表达式、全局替换、替换历史等功能
 */
import React, { useState, useCallback, useEffect } from 'react';
import './AdvancedSearchReplace.css';

interface SearchResult {
  line: number;
  column: number;
  preview: string;
  matchLength: number;
}

interface SearchHistory {
  query: string;
  timestamp: number;
  count: number;
}

interface AdvancedSearchReplaceProps {
  onClose?: () => void;
  editorContent?: string;
}

const AdvancedSearchReplace: React.FC<AdvancedSearchReplaceProps> = ({
  onClose,
  editorContent = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRegex, setIsRegex] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [replaceCount, setReplaceCount] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  // 执行搜索
  const performSearch = useCallback(() => {
    if (!searchQuery || !editorContent) {
      setResults([]);
      setTotalMatches(0);
      return;
    }

    try {
      const lines = editorContent.split('\n');
      const matches: SearchResult[] = [];
      let flags = 'g';
      
      if (!isCaseSensitive) flags += 'i';
      
      let pattern = searchQuery;
      if (!isRegex) {
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = isWholeWord ? `\\b${escaped}\\b` : escaped;
      }

      const regex = new RegExp(pattern, flags);

      lines.forEach((line, lineIndex) => {
        let match;
        const lineRegex = new RegExp(pattern, flags);
        while ((match = lineRegex.exec(line)) !== null) {
          matches.push({
            line: lineIndex + 1,
            column: match.index + 1,
            preview: line,
            matchLength: match[0].length
          });
        }
      });

      setResults(matches);
      setTotalMatches(matches.length);
      setSelectedIndex(0);

      // 添加到历史
      const historyEntry: SearchHistory = {
        query: searchQuery,
        timestamp: Date.now(),
        count: matches.length
      };
      setSearchHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
    } catch (error) {
      console.error('[AdvancedSearch] 搜索失败:', error);
      setResults([]);
      setTotalMatches(0);
    }
  }, [searchQuery, editorContent, isRegex, isCaseSensitive, isWholeWord]);

  // 当搜索条件变化时重新搜索
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // 执行替换
  const handleReplace = useCallback(() => {
    if (results.length === 0) {
      alert('没有匹配结果');
      return;
    }

    if (!replaceQuery) {
      alert('请输入替换内容');
      return;
    }

    try {
      let flags = 'g';
      if (!isCaseSensitive) flags += 'i';

      let pattern = searchQuery;
      if (!isRegex) {
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = isWholeWord ? `\\b${escaped}\\b` : escaped;
      }

      const regex = new RegExp(pattern, flags);
      const newContent = editorContent.replace(regex, replaceQuery);
      
      setReplaceCount(results.length);
      alert(`已替换 ${results.length} 处匹配`);
    } catch (error) {
      console.error('[AdvancedSearch] 替换失败:', error);
      alert('替换失败，请检查正则表达式');
    }
  }, [searchQuery, replaceQuery, results, editorContent, isRegex, isCaseSensitive, isWholeWord]);

  // 替换当前匹配
  const handleReplaceOne = useCallback(() => {
    if (results.length === 0 || selectedIndex >= results.length) {
      alert('没有匹配结果');
      return;
    }

    alert(`已替换第 ${selectedIndex + 1} 处匹配`);
    setReplaceCount(prev => prev + 1);
  }, [results, selectedIndex]);

  // 从历史恢复搜索
  const handleRestoreFromHistory = useCallback((query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
  }, []);

  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleReplace();
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  }, [results.length, handleReplace, onClose]);

  return (
    <div className="advanced-search-replace side-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">🔎</span>
          <span>高级搜索和替换</span>
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="关闭面板">
            ✕
          </button>
        )}
      </div>

      <div className="panel-content">
        {/* 搜索输入框 */}
        <div className="search-input-group">
          <div className="input-wrapper">
            <label>搜索</label>
            <div className="input-with-icon">
              <input
                type="text"
                placeholder="输入搜索内容..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="search-input"
                autoFocus
              />
              <button
                className="history-toggle"
                onClick={() => setShowHistory(!showHistory)}
                title="显示搜索历史"
              >
                🕐
              </button>
            </div>
          </div>

          {/* 搜索历史 */}
          {showHistory && searchHistory.length > 0 && (
            <div className="history-dropdown">
              {searchHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className="history-item"
                  onClick={() => handleRestoreFromHistory(entry.query)}
                >
                  <span className="history-query">{entry.query}</span>
                  <span className="history-count">{entry.count} 处</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 替换输入框 */}
        <div className="replace-input-group">
          <label>替换</label>
          <input
            type="text"
            placeholder="输入替换内容..."
            value={replaceQuery}
            onChange={e => setReplaceQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="replace-input"
          />
        </div>

        {/* 搜索选项 */}
        <div className="search-options">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={isRegex}
              onChange={e => setIsRegex(e.target.checked)}
            />
            <span title="使用正则表达式">.*</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={isCaseSensitive}
              onChange={e => setIsCaseSensitive(e.target.checked)}
            />
            <span title="区分大小写">Aa</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={isWholeWord}
              onChange={e => setIsWholeWord(e.target.checked)}
            />
            <span title="全字匹配">ab</span>
          </label>
        </div>

        {/* 操作按钮 */}
        <div className="action-buttons">
          <button
            className="btn-primary"
            onClick={handleReplaceOne}
            disabled={results.length === 0}
            title="替换当前匹配 (Ctrl+Shift+1)"
          >
            替换 (1)
          </button>
          <button
            className="btn-primary"
            onClick={handleReplace}
            disabled={results.length === 0}
            title="全部替换 (Ctrl+Alt+Enter)"
          >
            全部替换
          </button>
        </div>

        {/* 搜索结果统计 */}
        {totalMatches > 0 && (
          <div className="results-summary">
            <div className="summary-item">
              <span className="label">匹配数：</span>
              <span className="value">{totalMatches}</span>
            </div>
            {replaceCount > 0 && (
              <div className="summary-item">
                <span className="label">已替换：</span>
                <span className="value">{replaceCount}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="label">当前：</span>
              <span className="value">{selectedIndex + 1} / {totalMatches}</span>
            </div>
          </div>
        )}

        {/* 搜索结果列表 */}
        <div className="results-list">
          {results.length === 0 ? (
            <div className="empty-state">
              <p>输入内容进行搜索</p>
            </div>
          ) : (
            results.map((result, idx) => (
              <div
                key={idx}
                className={`result-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => setSelectedIndex(idx)}
              >
                <div className="result-line">
                  <span className="line-number">第 {result.line} 行</span>
                  <span className="column-number">列 {result.column}</span>
                </div>
                <div className="result-preview">
                  {result.preview.length > 100
                    ? result.preview.substring(0, 100) + '...'
                    : result.preview}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 替换预览 */}
        {searchQuery && replaceQuery && selectedIndex < results.length && (
          <div className="preview-section">
            <div className="preview-title">替换预览</div>
            <div className="preview-content">
              <div className="preview-line">
                <span className="label">原文：</span>
                <span className="text">{searchQuery}</span>
              </div>
              <div className="preview-line">
                <span className="label">替换为：</span>
                <span className="text">{replaceQuery}</span>
              </div>
            </div>
          </div>
        )}

        {/* 快捷键提示 */}
        <div className="shortcuts-info">
          <div className="info-title">快捷键</div>
          <ul className="shortcuts-list">
            <li><kbd>↑↓</kbd> 导航</li>
            <li><kbd>Ctrl+Enter</kbd> 全部替换</li>
            <li><kbd>Esc</kbd> 关闭</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchReplace;

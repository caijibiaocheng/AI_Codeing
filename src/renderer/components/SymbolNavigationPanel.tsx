/**
 * 符号导航面板 - 快速跳转到定义、查看引用
 * 支持智能符号搜索和导航
 */
import React, { useState, useCallback, useEffect } from 'react';
import './SymbolNavigationPanel.css';

interface SymbolReference {
  line: number;
  column: number;
  preview: string;
  type: 'definition' | 'reference';
}

interface NavigationHistory {
  symbol: string;
  file: string;
  line: number;
  timestamp: number;
}

interface SymbolNavigationPanelProps {
  onClose?: () => void;
  currentFile?: string;
  editorContent?: string;
}

const SymbolNavigationPanel: React.FC<SymbolNavigationPanelProps> = ({
  onClose,
  currentFile = '',
  editorContent = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [symbols, setSymbols] = useState<SymbolReference[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState<NavigationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'definition' | 'references' | 'history'>('definition');

  // 提取当前文件的所有符号
  const extractSymbols = useCallback(() => {
    if (!editorContent || !searchTerm) {
      setSymbols([]);
      return;
    }

    const lines = editorContent.split('\n');
    const results: SymbolReference[] = [];
    const regex = new RegExp(searchTerm, 'gi');

    lines.forEach((line, lineIndex) => {
      let match;
      const localRegex = new RegExp(searchTerm, 'gi');
      while ((match = localRegex.exec(line)) !== null) {
        results.push({
          line: lineIndex + 1,
          column: match.index + 1,
          preview: line.trim(),
          type: lineIndex === 0 ? 'definition' : 'reference'
        });
      }
    });

    setSymbols(results);
    setSelectedIndex(0);
  }, [editorContent, searchTerm]);

  useEffect(() => {
    extractSymbols();
  }, [extractSymbols]);

  const handleSymbolClick = useCallback((symbol: SymbolReference) => {
    const newHistoryEntry: NavigationHistory = {
      symbol: searchTerm,
      file: currentFile,
      line: symbol.line,
      timestamp: Date.now()
    };
    setHistory(prev => [newHistoryEntry, ...prev.slice(0, 19)]);

    // TODO: 实现实际的行导航功能
    console.log(`[SymbolNavigation] Navigate to ${currentFile}:${symbol.line}:${symbol.column}`);
  }, [searchTerm, currentFile]);

  const handleGoToDefinition = useCallback(() => {
    if (symbols.length > 0) {
      const definition = symbols.find(s => s.type === 'definition') || symbols[0];
      handleSymbolClick(definition);
    }
  }, [symbols, handleSymbolClick]);

  const handleRename = useCallback(() => {
    if (symbols.length === 0) {
      alert('未找到符号。请先搜索符号。');
      return;
    }
    
    const newName = prompt(`重命名 "${searchTerm}"：`, searchTerm);
    if (!newName || newName === searchTerm) return;

    // 模拟重命名操作
    alert(`已将 ${symbols.length} 个引用从 "${searchTerm}" 重命名为 "${newName}"`);
  }, [symbols, searchTerm]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, symbols.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && symbols.length > 0) {
      e.preventDefault();
      handleSymbolClick(symbols[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  }, [symbols, selectedIndex, handleSymbolClick, onClose]);

  const references = symbols.filter(s => s.type === 'reference');
  const definitions = symbols.filter(s => s.type === 'definition');

  return (
    <div className="symbol-navigation-panel side-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">🔍</span>
          <span>符号导航</span>
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose} aria-label="关闭面板">
            ✕
          </button>
        )}
      </div>

      <div className="panel-content">
        {/* 搜索输入框 */}
        <div className="search-container">
          <input
            type="text"
            placeholder="输入符号名称..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="symbol-search-input"
            autoFocus
          />
          <div className="search-actions">
            <button
              title="转到定义 (Ctrl+Click)"
              onClick={handleGoToDefinition}
              className="action-button"
            >
              📍
            </button>
            <button
              title="重命名所有引用"
              onClick={handleRename}
              className="action-button"
            >
              ✏️
            </button>
          </div>
        </div>

        {/* 标签页 */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'definition' ? 'active' : ''}`}
            onClick={() => setActiveTab('definition')}
          >
            定义 ({definitions.length})
          </button>
          <button
            className={`tab ${activeTab === 'references' ? 'active' : ''}`}
            onClick={() => setActiveTab('references')}
          >
            引用 ({references.length})
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            历史 ({history.length})
          </button>
        </div>

        {/* 定义标签页 */}
        {activeTab === 'definition' && (
          <div className="symbols-list">
            {definitions.length === 0 ? (
              <div className="empty-state">
                <p>搜索符号以查看定义</p>
              </div>
            ) : (
              definitions.map((symbol, idx) => (
                <div
                  key={idx}
                  className={`symbol-item ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSymbolClick(symbol)}
                >
                  <div className="symbol-header">
                    <span className="symbol-badge">DEF</span>
                    <span className="symbol-location">第 {symbol.line} 行</span>
                  </div>
                  <div className="symbol-preview">{symbol.preview}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 引用标签页 */}
        {activeTab === 'references' && (
          <div className="symbols-list">
            {references.length === 0 ? (
              <div className="empty-state">
                <p>未找到引用</p>
              </div>
            ) : (
              references.map((symbol, idx) => (
                <div
                  key={idx}
                  className={`symbol-item ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSymbolClick(symbol)}
                >
                  <div className="symbol-header">
                    <span className="symbol-badge">REF</span>
                    <span className="symbol-location">第 {symbol.line} 行</span>
                  </div>
                  <div className="symbol-preview">{symbol.preview}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 历史标签页 */}
        {activeTab === 'history' && (
          <div className="symbols-list">
            {history.length === 0 ? (
              <div className="empty-state">
                <p>浏览历史为空</p>
              </div>
            ) : (
              history.map((entry, idx) => (
                <div
                  key={idx}
                  className="history-item"
                  onClick={() => {
                   // TODO: 实现实际的行导航功能
                   console.log(`[SymbolNavigation] Navigate to line ${entry.line}`);
                  }}
                >
                  <div className="history-header">
                    <span className="history-symbol">{entry.symbol}</span>
                    <span className="history-file">{entry.file}</span>
                  </div>
                  <div className="history-time">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                  {/* TODO: 点击时导航到相应位置 */}
                </div>
              ))
            )}
          </div>
        )}

        {/* 信息统计 */}
        {symbols.length > 0 && activeTab !== 'history' && (
          <div className="symbols-stats">
            <div className="stat">
              <span className="stat-label">总数：</span>
              <span className="stat-value">{symbols.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">定义：</span>
              <span className="stat-value">{definitions.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">引用：</span>
              <span className="stat-value">{references.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* 快捷键帮助 */}
      <div className="panel-footer">
        <div className="help-text">
          <kbd>↑↓</kbd> 导航 • <kbd>Enter</kbd> 跳转 • <kbd>Esc</kbd> 关闭
        </div>
      </div>
    </div>
  );
};

export default SymbolNavigationPanel;

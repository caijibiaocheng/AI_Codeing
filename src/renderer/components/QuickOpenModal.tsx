import React, { useState, useEffect, useRef } from 'react';
import './QuickOpenModal.css';

interface FileMatch {
  path: string;
  name: string;
  score: number;
  isRecent?: boolean;
}

interface QuickOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (filePath: string) => void;
  rootPath: string;
}

const QuickOpenModal: React.FC<QuickOpenModalProps> = ({ isOpen, onClose, onFileSelect, rootPath }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileMatch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 加载最近文件
  useEffect(() => {
    if (isOpen && window.electronAPI) {
      window.electronAPI.getRecentFiles().then((files: string[]) => {
        setRecentFiles(files || []);
        if (!query) {
          setResults(files.map((path, i) => ({
            path,
            name: path.split(/[/\\]/).pop() || path,
            score: 1000 - i,
            isRecent: true
          })));
        }
      });
    }
  }, [isOpen]);

  // 搜索文件
  useEffect(() => {
    if (!isOpen || !rootPath) return;

    const searchFiles = async () => {
      if (!query.trim()) {
        // 显示最近文件
        setResults(recentFiles.map((path, i) => ({
          path,
          name: path.split(/[/\\]/).pop() || path,
          score: 1000 - i,
          isRecent: true
        })));
        setSelectedIndex(0);
        return;
      }

      const result = await window.electronAPI.searchFiles(rootPath, query);
      if (result.success && result.data) {
        const matches = result.data
          .map((file: any) => ({
            path: file.path,
            name: file.name,
            score: calculateMatchScore(file.name, file.path, query),
            isRecent: recentFiles.includes(file.path)
          }))
          .sort((a: FileMatch, b: FileMatch) => {
            // 最近文件优先
            if (a.isRecent && !b.isRecent) return -1;
            if (!a.isRecent && b.isRecent) return 1;
            // 按评分排序
            return b.score - a.score;
          })
          .slice(0, 50); // 限制结果数量

        setResults(matches);
        setSelectedIndex(0);
      }
    };

    const debounceTimer = setTimeout(searchFiles, 150);
    return () => clearTimeout(debounceTimer);
  }, [query, rootPath, isOpen, recentFiles]);

  // 焦点管理
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 模糊匹配评分算法
  const calculateMatchScore = (name: string, path: string, query: string): number => {
    const lowerName = name.toLowerCase();
    const lowerPath = path.toLowerCase();
    const lowerQuery = query.toLowerCase();

    let score = 0;

    // 完全匹配最高分
    if (lowerName === lowerQuery) return 1000;

    // 文件名开头匹配
    if (lowerName.startsWith(lowerQuery)) score += 500;

    // 连续字符匹配
    let consecutiveMatches = 0;
    let queryIndex = 0;
    for (let i = 0; i < lowerName.length && queryIndex < lowerQuery.length; i++) {
      if (lowerName[i] === lowerQuery[queryIndex]) {
        consecutiveMatches++;
        queryIndex++;
        score += consecutiveMatches * 10; // 连续匹配加分更多
      } else {
        consecutiveMatches = 0;
      }
    }

    // 首字母匹配（驼峰命名）
    const camelMatches = lowerQuery.split('').every((char, i) => {
      const index = lowerName.indexOf(char, i);
      return index !== -1;
    });
    if (camelMatches) score += 100;

    // 路径深度惩罚（浅层文件优先）
    const depth = path.split(/[/\\]/).length;
    score -= depth * 5;

    return score;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].path);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelect = async (filePath: string) => {
    await window.electronAPI.addRecentFile(filePath);
    onFileSelect(filePath);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="quick-open-overlay" onClick={onClose}>
      <div className="quick-open-modal" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          className="quick-open-input"
          placeholder="Search files by name... (Ctrl+P)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="quick-open-results">
          {results.length === 0 ? (
            <div className="quick-open-empty">
              {query ? 'No files found' : rootPath ? 'Start typing to search files' : 'Open a folder first'}
            </div>
          ) : (
            results.map((result, index) => (
              <div
                key={result.path}
                className={`quick-open-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(result.path)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="quick-open-item-icon">
                  {result.isRecent ? '🕒' : '📄'}
                </div>
                <div className="quick-open-item-content">
                  <div className="quick-open-item-name">{result.name}</div>
                  <div className="quick-open-item-path">{result.path}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="quick-open-footer">
          <span>↑↓ Navigate</span>
          <span>Enter Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
};

export default QuickOpenModal;

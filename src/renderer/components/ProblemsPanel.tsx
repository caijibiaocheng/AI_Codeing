/**
 * Problems Panel - 问题诊断面板
 * 显示代码错误、警告和提示信息
 */
import React, { useState, useEffect } from 'react';

export interface Problem {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  column: number;
  source?: string;
  code?: string;
}

interface ProblemsPanelProps {
  onClose: () => void;
  onProblemClick?: (problem: Problem) => void;
  currentFile?: string;
}

const ProblemsPanel: React.FC<ProblemsPanelProps> = ({
  onClose,
  onProblemClick,
  currentFile
}) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [currentFileOnly, setCurrentFileOnly] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadProblems();
    
    // 监听问题更新事件
    const handleProblemsUpdated = (newProblems: Problem[]) => {
      setProblems(newProblems);
    };

    if (window.electronAPI && window.electronAPI.onProblemsUpdated) {
      const unsubscribe = window.electronAPI.onProblemsUpdated(handleProblemsUpdated);
      return () => unsubscribe?.();
    }
  }, []);

  const loadProblems = async () => {
    if (!window.electronAPI || !window.electronAPI.getProblems) {
      // 如果API不可用，使用示例数据
      setProblems(getSampleProblems());
      return;
    }

    try {
      const result = await window.electronAPI.getProblems();
      if (result.success && result.problems) {
        setProblems(result.problems);
      }
    } catch (error) {
      console.error('[ProblemsPanel] Failed to load problems:', error);
      setProblems([]);
    }
  };

  const getSampleProblems = (): Problem[] => {
    return [
      {
        id: '1',
        severity: 'error',
        message: 'Cannot find name \'undefinedVariable\'',
        file: currentFile || 'example.ts',
        line: 45,
        column: 10,
        source: 'TypeScript',
        code: 'TS2304'
      },
      {
        id: '2',
        severity: 'warning',
        message: '\'unusedVar\' is declared but its value is never read',
        file: currentFile || 'example.ts',
        line: 12,
        column: 7,
        source: 'TypeScript',
        code: 'TS6133'
      },
      {
        id: '3',
        severity: 'info',
        message: 'File is not under \'rootDir\'. Consider adding it to \'include\' option',
        file: currentFile || 'example.ts',
        line: 1,
        column: 1,
        source: 'TypeScript',
        code: 'TS6059'
      }
    ];
  };

  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📄';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'error': return 'var(--error-color)';
      case 'warning': return 'var(--warning-color)';
      case 'info': return 'var(--info-color)';
      default: return 'var(--text-secondary)';
    }
  };

  const handleProblemItemClick = (problem: Problem) => {
    if (onProblemClick) {
      onProblemClick(problem);
    }
    if (window.notificationSystem) {
      window.notificationSystem.info(
        '跳转到问题位置',
        `${problem.file} 第 ${problem.line} 行`
      );
    }
  };

  const getFilteredProblems = (): Problem[] => {
    let filtered = problems;

    // 按严重程度过滤
    if (filter !== 'all') {
      filtered = filtered.filter(p => p.severity === filter);
    }

    // 只显示当前文件
    if (currentFileOnly && currentFile) {
      filtered = filtered.filter(p => p.file === currentFile);
    }

    // 搜索文本过滤
    if (searchText) {
      filtered = filtered.filter(p => 
        p.message.toLowerCase().includes(searchText.toLowerCase()) ||
        p.file.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  };

  const getProblemCounts = () => {
    const errors = problems.filter(p => p.severity === 'error').length;
    const warnings = problems.filter(p => p.severity === 'warning').length;
    const infos = problems.filter(p => p.severity === 'info').length;
    return { errors, warnings, infos, total: problems.length };
  };

  const handleClearAll = () => {
    if (window.confirm('确定要清除所有问题吗？')) {
      setProblems([]);
      if (window.notificationSystem) {
        window.notificationSystem.success('已清除', '所有问题已清空');
      }
    }
  };

  const filteredProblems = getFilteredProblems();
  const counts = getProblemCounts();

  return (
    <div className="side-panel problems-panel">
      <div className="panel-header">
        <h3>
          <span style={{ marginRight: '8px' }}>🐛</span>
          问题
        </h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-toolbar">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            title="所有问题"
          >
            全部 ({counts.total})
          </button>
          <button
            className={`filter-btn error ${filter === 'error' ? 'active' : ''}`}
            onClick={() => setFilter('error')}
            title="错误"
          >
            ❌ {counts.errors}
          </button>
          <button
            className={`filter-btn warning ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
            title="警告"
          >
            ⚠️ {counts.warnings}
          </button>
          <button
            className={`filter-btn info ${filter === 'info' ? 'active' : ''}`}
            onClick={() => setFilter('info')}
            title="信息"
          >
            ℹ️ {counts.infos}
          </button>
        </div>
        
        <div className="toolbar-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={currentFileOnly}
              onChange={(e) => setCurrentFileOnly(e.target.checked)}
            />
            仅当前文件
          </label>
          {problems.length > 0 && (
            <button
              className="clear-btn"
              onClick={handleClearAll}
              title="清除所有"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索问题..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="panel-content">
        {filteredProblems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {problems.length === 0 ? '✅' : '🔍'}
            </div>
            <p>
              {problems.length === 0 
                ? '没有问题' 
                : searchText 
                  ? '没有匹配的问题' 
                  : '当前筛选条件下无问题'}
            </p>
          </div>
        ) : (
          <div className="problems-list">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className={`problem-item severity-${problem.severity}`}
                onClick={() => handleProblemItemClick(problem)}
              >
                <div className="problem-header">
                  <span className="severity-icon">
                    {getSeverityIcon(problem.severity)}
                  </span>
                  <span className="problem-message">{problem.message}</span>
                </div>
                <div className="problem-details">
                  <span className="problem-file">{problem.file}</span>
                  <span className="problem-location">
                    [{problem.line}, {problem.column}]
                  </span>
                  {problem.source && (
                    <span className="problem-source">{problem.source}</span>
                  )}
                  {problem.code && (
                    <span className="problem-code">{problem.code}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel-footer">
        <div className="summary">
          <span className="summary-item error">
            ❌ {counts.errors} 错误
          </span>
          <span className="summary-item warning">
            ⚠️ {counts.warnings} 警告
          </span>
          <span className="summary-item info">
            ℹ️ {counts.infos} 信息
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProblemsPanel;

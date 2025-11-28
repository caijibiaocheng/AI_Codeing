import React, { useState, useEffect, useCallback } from 'react';
import './CodeMetricsPanel.css';

interface CodeMetrics {
  totalFiles: number;
  totalLines: number;
  totalCodeLines: number;
  totalCommentLines: number;
  totalBlankLines: number;
  languageDistribution: {
    [language: string]: {
      files: number;
      lines: number;
      percentage: number;
    };
  };
  largestFiles: {
    path: string;
    lines: number;
  }[];
  recentlyModified: {
    path: string;
    modifiedAt: number;
  }[];
}

interface CodeMetricsPanelProps {
  workspacePath?: string;
}

const CodeMetricsPanel: React.FC<CodeMetricsPanelProps> = ({ workspacePath }) => {
  const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languageExtensions: Record<string, string[]> = {
    JavaScript: ['.js', '.jsx', '.mjs'],
    TypeScript: ['.ts', '.tsx'],
    Python: ['.py'],
    Java: ['.java'],
    'C/C++': ['.c', '.cpp', '.h', '.hpp'],
    Go: ['.go'],
    Rust: ['.rs'],
    Ruby: ['.rb'],
    PHP: ['.php'],
    'C#': ['.cs'],
    HTML: ['.html', '.htm'],
    CSS: ['.css', '.scss', '.sass', '.less'],
    JSON: ['.json'],
    YAML: ['.yaml', '.yml'],
    Markdown: ['.md'],
    Shell: ['.sh', '.bash'],
    SQL: ['.sql']
  };

  const getLanguageByExtension = (filename: string): string => {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    for (const [language, extensions] of Object.entries(languageExtensions)) {
      if (extensions.includes(ext)) {
        return language;
      }
    }
    return 'Other';
  };

  const isCodeFile = (filename: string): boolean => {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return Object.values(languageExtensions).flat().includes(ext);
  };

  const analyzeFile = async (filePath: string) => {
    try {
      const result = await window.electronAPI.readFile(filePath);
      if (!result.success || !result.data) {
        return null;
      }

      const content = result.data;
      const lines = content.split('\n');
      const totalLines = lines.length;
      let codeLines = 0;
      let commentLines = 0;
      let blankLines = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') {
          blankLines++;
        } else if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          commentLines++;
        } else {
          codeLines++;
        }
      }

      return { totalLines, codeLines, commentLines, blankLines };
    } catch (error) {
      return null;
    }
  };

  const scanDirectory = async (dirPath: string, fileList: { path: string; stats: any }[] = []) => {
    try {
      const result = await window.electronAPI.readDirectory(dirPath);
      if (!result.success || !result.data) {
        return fileList;
      }

      for (const item of result.data) {
        const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'out', 'release'];
        
        if (item.isDirectory) {
          const dirName = item.name;
          if (!excludeDirs.includes(dirName) && !dirName.startsWith('.')) {
            await scanDirectory(item.path, fileList);
          }
        } else if (isCodeFile(item.name)) {
          fileList.push({ path: item.path, stats: null });
        }
      }

      return fileList;
    } catch (error) {
      return fileList;
    }
  };

  const calculateMetrics = useCallback(async () => {
    if (!workspacePath) {
      setError('No workspace path provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const files = await scanDirectory(workspacePath);

      if (files.length === 0) {
        setMetrics({
          totalFiles: 0,
          totalLines: 0,
          totalCodeLines: 0,
          totalCommentLines: 0,
          totalBlankLines: 0,
          languageDistribution: {},
          largestFiles: [],
          recentlyModified: []
        });
        setLoading(false);
        return;
      }

      let totalLines = 0;
      let totalCodeLines = 0;
      let totalCommentLines = 0;
      let totalBlankLines = 0;
      const languageStats: Record<string, { files: number; lines: number }> = {};
      const fileSizes: { path: string; lines: number }[] = [];

      for (const file of files.slice(0, 500)) {
        const analysis = await analyzeFile(file.path);
        if (!analysis) continue;

        totalLines += analysis.totalLines;
        totalCodeLines += analysis.codeLines;
        totalCommentLines += analysis.commentLines;
        totalBlankLines += analysis.blankLines;

        const language = getLanguageByExtension(file.path);
        if (!languageStats[language]) {
          languageStats[language] = { files: 0, lines: 0 };
        }
        languageStats[language].files++;
        languageStats[language].lines += analysis.totalLines;

        fileSizes.push({ path: file.path, lines: analysis.totalLines });
      }

      const languageDistribution: CodeMetrics['languageDistribution'] = {};
      for (const [language, stats] of Object.entries(languageStats)) {
        languageDistribution[language] = {
          files: stats.files,
          lines: stats.lines,
          percentage: (stats.lines / totalLines) * 100
        };
      }

      const largestFiles = fileSizes
        .sort((a, b) => b.lines - a.lines)
        .slice(0, 10);

      setMetrics({
        totalFiles: files.length,
        totalLines,
        totalCodeLines,
        totalCommentLines,
        totalBlankLines,
        languageDistribution,
        largestFiles,
        recentlyModified: []
      });
    } catch (err: any) {
      setError(err.message || 'Failed to calculate metrics');
    } finally {
      setLoading(false);
    }
  }, [workspacePath]);

  useEffect(() => {
    if (workspacePath) {
      calculateMetrics();
    }
  }, [workspacePath, calculateMetrics]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getFileName = (filePath: string) => {
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1];
  };

  const getRelativePath = (filePath: string) => {
    if (!workspacePath) return filePath;
    return filePath.replace(workspacePath, '').replace(/^[/\\]/, '');
  };

  if (!workspacePath) {
    return (
      <div className="code-metrics-panel">
        <div className="metrics-header">
          <h3>📊 Code Metrics</h3>
        </div>
        <div className="empty-state">
          <p>No workspace opened</p>
          <p className="hint">Open a folder to view code metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="code-metrics-panel">
      <div className="metrics-header">
        <h3>📊 Code Metrics</h3>
        <button
          className="btn-primary"
          onClick={calculateMetrics}
          disabled={loading}
        >
          {loading ? '⏳ Scanning...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading && !metrics && (
        <div className="loading-state">
          <p>Analyzing codebase...</p>
          <p className="hint">This may take a moment for large projects</p>
        </div>
      )}

      {metrics && (
        <div className="metrics-content">
          <div className="metrics-section">
            <h4>📈 Overview</h4>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{formatNumber(metrics.totalFiles)}</div>
                <div className="metric-label">Total Files</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{formatNumber(metrics.totalLines)}</div>
                <div className="metric-label">Total Lines</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{formatNumber(metrics.totalCodeLines)}</div>
                <div className="metric-label">Code Lines</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{formatNumber(metrics.totalCommentLines)}</div>
                <div className="metric-label">Comments</div>
              </div>
            </div>
          </div>

          <div className="metrics-section">
            <h4>🌐 Language Distribution</h4>
            <div className="language-list">
              {Object.entries(metrics.languageDistribution)
                .sort((a, b) => b[1].lines - a[1].lines)
                .map(([language, stats]) => (
                  <div key={language} className="language-item">
                    <div className="language-header">
                      <span className="language-name">{language}</span>
                      <span className="language-stats">
                        {stats.files} files · {formatNumber(stats.lines)} lines
                      </span>
                    </div>
                    <div className="language-bar">
                      <div
                        className="language-bar-fill"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <div className="language-percentage">
                      {stats.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {metrics.largestFiles.length > 0 && (
            <div className="metrics-section">
              <h4>📄 Largest Files</h4>
              <div className="file-list">
                {metrics.largestFiles.map((file, index) => (
                  <div key={file.path} className="file-item">
                    <span className="file-rank">#{index + 1}</span>
                    <div className="file-info">
                      <div className="file-name">{getFileName(file.path)}</div>
                      <div className="file-path">{getRelativePath(file.path)}</div>
                    </div>
                    <span className="file-lines">{formatNumber(file.lines)} lines</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeMetricsPanel;

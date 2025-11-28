import React, { useState, useEffect } from 'react';

interface StatusBarProps {
  currentFilePath?: string;
  cursorPosition?: { line: number; column: number };
  encoding?: string;
  lineEnding?: string;
  language?: string;
  gitBranch?: string;
  gitStatus?: string;
  theme?: 'light' | 'dark';
}

const StatusBar: React.FC<StatusBarProps> = ({
  currentFilePath,
  cursorPosition = { line: 1, column: 1 },
  encoding = 'UTF-8',
  lineEnding = 'LF',
  language = 'plaintext',
  gitBranch,
  gitStatus,
  theme = 'dark'
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getGitStatusIcon = (status?: string) => {
    if (!status) return '';
    if (status.includes('M') || status.includes(' A')) return '●';
    if (status.includes('??')) return '+';
    return '';
  };

  const truncatePath = (path?: string) => {
    if (!path) return '无文件';
    const parts = path.split(/[/\\]/);
    if (parts.length <= 3) return path;
    return `.../${parts.slice(-2).join('/')}`;
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        {/* 当前文件路径 */}
        <span className="status-item" title={currentFilePath}>
          📄 {truncatePath(currentFilePath)}
        </span>
        
        {/* Git 分支和状态 */}
        {gitBranch && (
          <span className="status-item git-status">
            🔀 {gitBranch}
            {getGitStatusIcon(gitStatus) && (
              <span className="git-changes">{getGitStatusIcon(gitStatus)}</span>
            )}
          </span>
        )}
        
        {/* 语言模式 */}
        <span className="status-item">
          🌐 {language}
        </span>
      </div>

      <div className="status-center">
        {/* 光标位置 */}
        <span className="status-item">
          行 {cursorPosition.line}, 列 {cursorPosition.column}
        </span>
        
        {/* 编码信息 */}
        <span className="status-item">
          {encoding} {lineEnding}
        </span>
      </div>

      <div className="status-right">
        {/* 通知图标 */}
        <span className="status-item clickable" title="通知">
          🔔
        </span>
        
        {/* 主题指示器 */}
        <span className="status-item" title={`当前主题: ${theme}`}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
        
        {/* 当前时间 */}
        <span className="status-item time">
          {formatTime(currentTime)}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
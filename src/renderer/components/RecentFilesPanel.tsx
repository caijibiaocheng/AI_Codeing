/**
 * Recent Files Panel - 最近文件侧边栏面板
 * 显示最近打开的文件列表，支持快速访问和管理
 */
import React, { useState, useEffect } from 'react';

interface RecentFile {
  path: string;
  name: string;
  timestamp: number;
  language?: string;
}

interface RecentFilesPanelProps {
  onClose: () => void;
  onFileSelect: (filePath: string) => void;
  currentFile?: string;
}

const RecentFilesPanel: React.FC<RecentFilesPanelProps> = ({
  onClose,
  onFileSelect,
  currentFile
}) => {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    if (!window.electronAPI) return;
    
    try {
      const files = await window.electronAPI.getRecentFiles?.();
      if (files) {
        // Transform string[] to RecentFile[] if needed
        const recentFilesList: RecentFile[] = Array.isArray(files) 
          ? files.map((filePath: string | RecentFile) => {
              if (typeof filePath === 'string') {
                const pathParts = filePath.split(/[\\/]/);
                return {
                  path: filePath,
                  name: pathParts[pathParts.length - 1],
                  timestamp: Date.now(),
                };
              }
              return filePath;
            })
          : [];
        setRecentFiles(recentFilesList);
      }
    } catch (error) {
      console.error('[RecentFilesPanel] Failed to load recent files:', error);
    }
  };

  const handleFileClick = (filePath: string) => {
    onFileSelect(filePath);
  };

  const handleClearAll = async () => {
    if (!window.electronAPI || !window.electronAPI.clearRecentFiles) return;
    
    if (window.confirm('确定要清除所有最近文件记录吗？')) {
      try {
        await window.electronAPI.clearRecentFiles();
        setRecentFiles([]);
        if (window.notificationSystem) {
          window.notificationSystem.success('已清除', '最近文件记录已清空');
        }
      } catch (error) {
        console.error('[RecentFilesPanel] Failed to clear recent files:', error);
        if (window.notificationSystem) {
          window.notificationSystem.error('清除失败', '无法清除最近文件记录');
        }
      }
    }
  };

  const handleRemoveFile = async (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.electronAPI || !window.electronAPI.removeRecentFile) return;
    
    try {
      await window.electronAPI.removeRecentFile(filePath);
      setRecentFiles(recentFiles.filter(f => f.path !== filePath));
    } catch (error) {
      console.error('[RecentFilesPanel] Failed to remove file:', error);
    }
  };

  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚才';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'ts': '📘',
      'tsx': '⚛️',
      'js': '📙',
      'jsx': '⚛️',
      'json': '📋',
      'md': '📝',
      'css': '🎨',
      'scss': '🎨',
      'html': '🌐',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'go': '🔷',
      'rs': '🦀',
      'vue': '💚',
    };
    return iconMap[ext || ''] || '📄';
  };

  const filteredFiles = recentFiles.filter(file => 
    file.name.toLowerCase().includes(filter.toLowerCase()) ||
    file.path.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="side-panel recent-files-panel">
      <div className="panel-header">
        <h3>
          <span style={{ marginRight: '8px' }}>🕒</span>
          最近文件
        </h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-toolbar">
        <input
          type="text"
          className="filter-input"
          placeholder="搜索文件..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {recentFiles.length > 0 && (
          <button className="clear-btn" onClick={handleClearAll} title="清除所有">
            🗑️
          </button>
        )}
      </div>

      <div className="panel-content">
        {filteredFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p>{filter ? '没有匹配的文件' : '暂无最近文件'}</p>
          </div>
        ) : (
          <div className="recent-files-list">
            {filteredFiles.map((file, index) => (
              <div
                key={`${file.path}-${index}`}
                className={`recent-file-item ${currentFile === file.path ? 'active' : ''}`}
                onClick={() => handleFileClick(file.path)}
                title={file.path}
              >
                <div className="file-icon">{getFileIcon(file.name)}</div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-path">{file.path}</div>
                  <div className="file-time">{getRelativeTime(file.timestamp)}</div>
                </div>
                <button
                  className="remove-btn"
                  onClick={(e) => handleRemoveFile(file.path, e)}
                  title="从列表移除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel-footer">
        <div className="info-text">
          共 {recentFiles.length} 个文件
        </div>
      </div>
    </div>
  );
};

export default RecentFilesPanel;

import React, { useEffect, useState } from 'react';
import './RecentFilesModal.css';

interface RecentFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (filePath: string) => void;
}

const getFileIcon = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'js':
    case 'jsx':
      return '📜';
    case 'ts':
    case 'tsx':
      return '📘';
    case 'py':
      return '🐍';
    case 'java':
      return '☕';
    case 'cpp':
    case 'c':
    case 'h':
      return '⚙️';
    case 'html':
      return '🌐';
    case 'css':
    case 'scss':
    case 'sass':
      return '🎨';
    case 'json':
      return '📋';
    case 'md':
      return '📝';
    case 'xml':
      return '📄';
    case 'sh':
      return '💻';
    default:
      return '📄';
  }
};

const RecentFilesModal: React.FC<RecentFilesModalProps> = ({
  isOpen,
  onClose,
  onFileSelect
}) => {
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && window.electronAPI) {
      loadRecentFiles();
    }
  }, [isOpen]);

  const loadRecentFiles = async () => {
    setIsLoading(true);
    try {
      const files = await window.electronAPI.getRecentFiles();
      // 过滤掉不存在的文件
      const existingFiles: string[] = [];
      for (const file of files || []) {
        try {
          const result = await window.electronAPI.readFile(file);
          if (result.success) {
            existingFiles.push(file);
          }
        } catch {
          // 文件不存在，跳过
        }
      }
      setRecentFiles(existingFiles);
    } catch (error) {
      console.error('Failed to load recent files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = (filePath: string) => {
    onFileSelect(filePath);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getFileName = (filePath: string) => {
    return filePath.split(/[/\\]/).pop() || filePath;
  };

  if (!isOpen) return null;

  return (
    <div className="recent-files-modal" onClick={handleBackdropClick}>
      <div className="recent-files-content">
        <div className="recent-files-header">
          <h3>Recent Files</h3>
          <button className="recent-files-close" onClick={onClose}>×</button>
        </div>
        
        <div className="recent-files-list">
          {isLoading ? (
            <div className="recent-files-empty">
              Loading...
            </div>
          ) : recentFiles.length === 0 ? (
            <div className="recent-files-empty">
              No recent files
            </div>
          ) : (
            recentFiles.map((filePath, index) => (
              <div
                key={index}
                className="recent-file-item"
                onClick={() => handleFileClick(filePath)}
              >
                <span className="recent-file-icon">{getFileIcon(filePath)}</span>
                <div className="recent-file-info">
                  <div className="recent-file-name">{getFileName(filePath)}</div>
                  <div className="recent-file-path">{filePath}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentFilesModal;

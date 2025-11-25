import React, { useState, useEffect } from 'react';
import ContextMenu, { MenuItem } from './ContextMenu';
import { t } from '../i18n';
import './FileExplorer.css';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
}

interface FileExplorerProps {
  rootPath: string;
  onFileSelect: (filePath: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ rootPath, onFileSelect }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileItem } | null>(null);

  useEffect(() => {
    if (rootPath) {
      loadDirectory(rootPath);
    }
  }, [rootPath]);

  const loadDirectory = async (dirPath: string) => {
    try {
      const result = await window.electronAPI.readDirectory(dirPath);
      if (result.success) {
        setFiles(result.data || []);
        // 自动展开根目录
        setExpandedDirs(new Set([dirPath]));
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
    }
  };

  const toggleDirectory = async (item: FileItem) => {
    if (!item.isDirectory) return;

    const newExpanded = new Set(expandedDirs);
    if (expandedDirs.has(item.path)) {
      newExpanded.delete(item.path);
    } else {
      newExpanded.add(item.path);
      // 加载子目录
      if (!item.children) {
        const result = await window.electronAPI.readDirectory(item.path);
        if (result.success) {
          item.children = result.data || [];
          setFiles([...files]);
        }
      }
    }
    setExpandedDirs(newExpanded);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      toggleDirectory(item);
    } else {
      onFileSelect(item.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const getContextMenuItems = (): MenuItem[] => {
    if (!contextMenu) return [];
    const { item } = contextMenu;
    
    return [
      {
        label: t('fileExplorer.newFile'),
        icon: '📄',
        action: async () => {
          const fileName = prompt(t('fileExplorer.enterFileName'));
          if (fileName) {
            const parentPath = item.isDirectory ? item.path : item.path.replace(/[\\/][^\\/]*$/, '');
            await window.electronAPI.createFile(parentPath, fileName);
            loadDirectory(rootPath);
          }
        },
        disabled: !item.isDirectory
      },
      {
        label: t('fileExplorer.newFolder'),
        icon: '📁',
        action: async () => {
          const folderName = prompt(t('fileExplorer.enterFolderName'));
          if (folderName) {
            const parentPath = item.isDirectory ? item.path : item.path.replace(/[\\/][^\\/]*$/, '');
            await window.electronAPI.createFolder(parentPath, folderName);
            loadDirectory(rootPath);
          }
        },
        disabled: !item.isDirectory
      },
      { separator: true },
      {
        label: t('fileExplorer.rename'),
        icon: '✏️',
        action: async () => {
          const newName = prompt(t('fileExplorer.enterNewName'), item.name);
          if (newName && newName !== item.name) {
            await window.electronAPI.renameItem(item.path, newName);
            loadDirectory(rootPath);
          }
        }
      },
      {
        label: t('fileExplorer.delete'),
        icon: '🗑️',
        action: async () => {
          if (confirm(t('fileExplorer.confirmDelete', item.name))) {
            await window.electronAPI.deleteItem(item.path);
            loadDirectory(rootPath);
          }
        }
      },
      { separator: true },
      {
        label: t('fileExplorer.copyPath'),
        icon: '📋',
        action: () => {
          window.electronAPI.copyToClipboard(item.path);
        }
      }
    ];
  };

  const getFileIcon = (name: string, isDirectory: boolean) => {
    if (isDirectory) return '📁';
    const ext = name.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'js': '📄',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '⚛️',
      'json': '📋',
      'md': '📝',
      'css': '🎨',
      'html': '🌐',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'go': '🔵',
      'rs': '🦀',
      'png': '🖼️',
      'jpg': '🖼️',
      'svg': '🖼️',
    };
    return iconMap[ext || ''] || '📄';
  };

  const renderFileTree = (items: FileItem[], level: number = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <div
          className={`file-item ${!item.isDirectory ? 'file' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleItemClick(item)}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          <span className="file-icon">
            {item.isDirectory && (expandedDirs.has(item.path) ? '📂' : '📁')}
            {!item.isDirectory && getFileIcon(item.name, false)}
          </span>
          <span className="file-name">{item.name}</span>
        </div>
        {item.isDirectory && expandedDirs.has(item.path) && item.children && (
          <div className="file-children">
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (!rootPath) {
    return (
      <div className="file-explorer-empty">
        <p>{t('fileExplorer.noFolderOpened')}</p>
        <p>{t('fileExplorer.openFolderToStart')}</p>
      </div>
    );
  }

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span>{t('fileExplorer.explorer')}</span>
      </div>
      <div className="file-explorer-content">
        {files.length > 0 ? renderFileTree(files) : <div className="loading">Loading...</div>}
      </div>
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default FileExplorer;

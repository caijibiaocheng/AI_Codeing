import React from 'react';
import './TabBar.css';

export interface Tab {
  id: string;
  title: string;
  filePath: string;
  isDirty: boolean;
  language: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onTabClick, onTabClose }) => {
  const getFileName = (path: string) => {
    return path.split(/[/\\]/).pop() || path;
  };

  const getFileIcon = (language: string) => {
    const iconMap: { [key: string]: string } = {
      javascript: '📄',
      typescript: '📘',
      python: '🐍',
      java: '☕',
      json: '📋',
      markdown: '📝',
      css: '🎨',
      html: '🌐',
      c: '⚙️',
      cpp: '⚙️',
      go: '🔵',
      rust: '🦀',
    };
    return iconMap[language] || '📄';
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="tab-bar">
      <div className="tab-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            <span className="tab-icon">{getFileIcon(tab.language)}</span>
            <span className="tab-title">{getFileName(tab.filePath)}</span>
            {tab.isDirty && <span className="tab-dirty-indicator">●</span>}
            <button
              className="tab-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title="Close"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabBar;

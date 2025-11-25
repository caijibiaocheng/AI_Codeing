import React, { useState } from 'react';
import { t } from '../i18n';
import HTTPClient from './HTTPClient';
import RegexTester from './RegexTester';
import ColorPicker from './ColorPicker';
import JSONViewer from './JSONViewer';
import CodeAnalysisPanel from './CodeAnalysisPanel';
import './ToolsPanel.css';

interface ToolsPanelProps {
  onClose: () => void;
}

type ToolType = 'http' | 'regex' | 'color' | 'json' | 'analysis' | null;

interface Tool {
  id: ToolType;
  nameKey: string;
  descKey: string;
  icon: string;
  component: React.ComponentType<{ onClose: () => void }>;
}

const TOOLS: Tool[] = [
  {
    id: 'http',
    nameKey: 'tools.httpClient',
    descKey: 'tools.httpClientDesc',
    icon: '🌐',
    component: HTTPClient
  },
  {
    id: 'regex',
    nameKey: 'tools.regexTester',
    descKey: 'tools.regexTesterDesc',
    icon: '🔍',
    component: RegexTester
  },
  {
    id: 'color',
    nameKey: 'tools.colorPicker',
    descKey: 'tools.colorPickerDesc',
    icon: '🎨',
    component: ColorPicker
  },
  {
    id: 'json',
    nameKey: 'tools.jsonViewer',
    descKey: 'tools.jsonViewerDesc',
    icon: '📋',
    component: JSONViewer
  },
  {
    id: 'analysis',
    nameKey: 'tools.codeAnalysis',
    descKey: 'tools.codeAnalysisDesc',
    icon: '📊',
    component: CodeAnalysisPanel
  }
];

const ToolsPanel: React.FC<ToolsPanelProps> = ({ onClose }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(null);

  const handleToolSelect = (toolId: ToolType) => {
    setActiveTool(toolId);
  };

  const handleToolClose = () => {
    setActiveTool(null);
  };

  if (activeTool) {
    const tool = TOOLS.find(t => t.id === activeTool);
    if (tool) {
      const ToolComponent = tool.component;
      return (
        <div className="tools-panel">
          <div className="tools-panel-header">
            <h3>{t(tool.nameKey)}</h3>
            <button 
              onClick={handleToolClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 8px'
              }}
              title={t('tools.back')}
            >
              ← {t('tools.back')}
            </button>
          </div>
          <div className="tool-content">
            <ToolComponent onClose={handleToolClose} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="tools-panel">
      <div className="tools-panel-header">
        <h3>{t('tools.title')}</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px 8px'
          }}
          title={t('common.close')}
        >
          ✕
        </button>
      </div>
      <div className="tools-grid">
        {TOOLS.map(tool => (
          <div
            key={tool.id}
            className="tool-card"
            onClick={() => handleToolSelect(tool.id)}
          >
            <div className="tool-card-icon">{tool.icon}</div>
            <h4 className="tool-card-title">{t(tool.nameKey)}</h4>
            <p className="tool-card-description">{t(tool.descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolsPanel;

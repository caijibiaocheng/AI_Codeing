/**
 * 应用状态管理 Context
 * 集中管理编辑器设置和 UI 面板状态
 */
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// 编辑器设置类型
export interface EditorSettings {
  theme: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
}

// UI 面板状态类型
export interface PanelState {
  isChatOpen: boolean;
  isSettingsOpen: boolean;
  isQuickOpenOpen: boolean;
  isGlobalSearchOpen: boolean;
  isComposerOpen: boolean;
  showGitPanel: boolean;
  isTerminalOpen: boolean;
  isDiffViewOpen: boolean;
  isExtensionPanelOpen: boolean;
  isAIAssistantOpen: boolean;
  isMarkdownPreviewOpen: boolean;
  isRecentFilesOpen: boolean;
  isTodoPanelOpen: boolean;
  isGitStashPanelOpen: boolean;
  isToolsPanelOpen: boolean;
}

// Context 值类型
interface AppContextValue {
  // UI Theme
  uiTheme: 'light' | 'dark';
  setUiTheme: (theme: 'light' | 'dark') => void;
  
  // Editor Settings
  editorSettings: EditorSettings;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
  
  // Panel State
  panels: PanelState;
  togglePanel: (panel: keyof PanelState) => void;
  setPanel: (panel: keyof PanelState, value: boolean) => void;
  
  // Current Folder
  currentFolder: string;
  setCurrentFolder: (folder: string) => void;
}

// 默认值
const defaultEditorSettings: EditorSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
  lineHeight: 1.5,
};

const defaultPanelState: PanelState = {
  isChatOpen: true,
  isSettingsOpen: false,
  isQuickOpenOpen: false,
  isGlobalSearchOpen: false,
  isComposerOpen: false,
  showGitPanel: false,
  isTerminalOpen: false,
  isDiffViewOpen: false,
  isExtensionPanelOpen: false,
  isAIAssistantOpen: false,
  isMarkdownPreviewOpen: false,
  isRecentFilesOpen: false,
  isTodoPanelOpen: false,
  isGitStashPanelOpen: false,
  isToolsPanelOpen: false,
};

// 创建 Context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider 组件
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uiTheme, setUiTheme] = useState<'light' | 'dark'>('dark');
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(defaultEditorSettings);
  const [panels, setPanels] = useState<PanelState>(defaultPanelState);
  const [currentFolder, setCurrentFolder] = useState<string>('');

  // 初始化加载配置
  useEffect(() => {
    const loadConfig = async () => {
      if (!window.electronAPI) return;
      
      try {
        const [savedTheme, savedEditorTheme, savedFontSize, savedFontFamily, savedLineHeight] = await Promise.all([
          window.electronAPI.getConfig('ui.theme'),
          window.electronAPI.getConfig('editor.theme'),
          window.electronAPI.getConfig('editor.fontSize'),
          window.electronAPI.getConfig('editor.fontFamily'),
          window.electronAPI.getConfig('editor.lineHeight'),
        ]);
        
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setUiTheme(savedTheme);
        }
        
        setEditorSettings(prev => ({
          ...prev,
          ...(typeof savedEditorTheme === 'string' && { theme: savedEditorTheme }),
          ...(typeof savedFontSize === 'number' && { fontSize: savedFontSize }),
          ...(typeof savedFontFamily === 'string' && { fontFamily: savedFontFamily }),
          ...(typeof savedLineHeight === 'number' && { lineHeight: savedLineHeight }),
        }));
      } catch (error) {
        console.error('[AppContext] Failed to load config:', error);
      }
    };
    
    loadConfig();
  }, []);

  // 更新编辑器设置
  const updateEditorSettings = useCallback((settings: Partial<EditorSettings>) => {
    setEditorSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // 切换面板状态
  const togglePanel = useCallback((panel: keyof PanelState) => {
    setPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  // 设置面板状态
  const setPanel = useCallback((panel: keyof PanelState, value: boolean) => {
    setPanels(prev => ({ ...prev, [panel]: value }));
  }, []);

  const value: AppContextValue = {
    uiTheme,
    setUiTheme,
    editorSettings,
    updateEditorSettings,
    panels,
    togglePanel,
    setPanel,
    currentFolder,
    setCurrentFolder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 自定义 Hook
export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// 导出便捷 Hooks
export const useUiTheme = () => {
  const { uiTheme, setUiTheme } = useApp();
  return { uiTheme, setUiTheme };
};

export const useEditorSettings = () => {
  const { editorSettings, updateEditorSettings } = useApp();
  return { editorSettings, updateEditorSettings };
};

export const usePanels = () => {
  const { panels, togglePanel, setPanel } = useApp();
  return { panels, togglePanel, setPanel };
};

export const useCurrentFolder = () => {
  const { currentFolder, setCurrentFolder } = useApp();
  return { currentFolder, setCurrentFolder };
};

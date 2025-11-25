/**
 * AI Code Editor - 渲染进程入口
 * 重构版本：使用 Context 和自定义 Hooks
 */
import React, { useEffect, useState, useCallback } from 'react';

// Components
import Editor from './components/Editor';
import ChatPanel from './components/ChatPanel';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import FileExplorer from './components/FileExplorer';
import QuickOpenModal from './components/QuickOpenModal';
import GlobalSearchPanel from './components/GlobalSearchPanel';
import TabBar, { Tab } from './components/TabBar';
import GitPanel from './components/GitPanel';
import AIComposer from './components/AIComposer';
import DiffViewer from './components/DiffViewer';
import Terminal from './components/Terminal';
import ExtensionPanel from './components/ExtensionPanel';

// Context & Hooks
import { AppProvider, useApp, usePanels, useEditorSettings, useCurrentFolder } from './contexts';
import { useTabs } from './hooks';

// Utils & i18n
import { detectLanguage } from './utils';
import { t } from './i18n';

import './App.css';

// ==================== 主应用内容 ====================
const AppContent: React.FC = () => {
  const { uiTheme, setUiTheme } = useApp();
  const { editorSettings, updateEditorSettings } = useEditorSettings();
  const { panels, togglePanel, setPanel } = usePanels();
  const { currentFolder, setCurrentFolder } = useCurrentFolder();
  
  // Tab 管理
  const {
    tabs,
    activeTabId,
    activeTab,
    fileContent,
    setFileContent,
    openTab,
    closeTab,
    switchTab,
    saveActiveTab
  } = useTabs(t('editor.welcome'));
  
  // Diff 视图数据
  const [diffData, setDiffData] = useState<{
    original: string;
    modified: string;
    path: string;
  } | null>(null);

  // 初始化语言设置
  useEffect(() => {
    const loadLocale = async () => {
      if (!window.electronAPI) return;
      const savedLocale = await window.electronAPI.getConfig('app.locale');
      if (savedLocale === 'zh-CN' || savedLocale === 'en-US') {
        const { setLocale } = await import('./i18n');
        setLocale(savedLocale);
      }
    };
    loadLocale();
  }, []);

  // 监听文件/文件夹打开事件
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleFileOpened = (filePath: string) => {
      openTab(filePath);
    };

    const handleFolderOpened = (folderPath: string) => {
      setCurrentFolder(folderPath);
    };

    const offFile = window.electronAPI.onFileOpened(handleFileOpened);
    const offFolder = window.electronAPI.onFolderOpened(handleFolderOpened);

    return () => {
      offFile?.();
      offFolder?.();
    };
  }, [openTab, setCurrentFolder]);

  // 监听保存快捷键
  useEffect(() => {
    if (!window.electronAPI) return;
    const offSave = window.electronAPI.onSaveFile(saveActiveTab);
    return () => offSave?.();
  }, [saveActiveTab]);

  // 设置保存回调
  const handleSettingsSaved = useCallback((opts: {
    theme?: 'light' | 'dark';
    editorTheme?: string;
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
  }) => {
    if (opts.theme) setUiTheme(opts.theme);
    if (opts.editorTheme) updateEditorSettings({ theme: opts.editorTheme });
    if (typeof opts.fontSize === 'number') updateEditorSettings({ fontSize: opts.fontSize });
    if (opts.fontFamily) updateEditorSettings({ fontFamily: opts.fontFamily });
    if (typeof opts.lineHeight === 'number') updateEditorSettings({ lineHeight: opts.lineHeight });
  }, [setUiTheme, updateEditorSettings]);

  // 查看 Diff
  const handleViewDiff = useCallback(async (filePath: string) => {
    if (!currentFolder) return;
    
    try {
      const headResult = await window.electronAPI.executeCommand(
        `git show HEAD:"${filePath}"`,
        currentFolder
      );
      
      const fullPath = `${currentFolder}\\${filePath}`;
      const currentResult = await window.electronAPI.readFile(fullPath);
      
      if (headResult.success && currentResult.success) {
        setDiffData({
          original: headResult.output || '',
          modified: currentResult.data || '',
          path: filePath
        });
        setPanel('isDiffViewOpen', true);
      } else {
        alert('Failed to load file diff');
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  }, [currentFolder, setPanel]);

  // 格式化代码
  const handleFormatCode = useCallback(async () => {
    if (!activeTab || !window.electronAPI) return;
    
    const isSupported = await window.electronAPI.isFormatSupported(activeTab.filePath);
    if (!isSupported) {
      alert(t('editor.formatNotSupported'));
      return;
    }
    
    const result = await window.electronAPI.formatCode(fileContent, activeTab.filePath);
    if (result.success && result.formatted) {
      setFileContent(result.formatted);
    } else if (result.error) {
      alert(`Format error: ${result.error}`);
    }
  }, [activeTab, fileContent, setFileContent]);

  // 全局快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        setPanel('isQuickOpenOpen', true);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        togglePanel('isGlobalSearchOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        togglePanel('isComposerOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        togglePanel('showGitPanel');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        togglePanel('isExtensionPanelOpen');
      }
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        togglePanel('isTerminalOpen');
      }
      if (e.shiftKey && e.altKey && e.key === 'F') {
        e.preventDefault();
        handleFormatCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel, setPanel, handleFormatCode]);

  // electronAPI 不可用时的降级 UI
  if (!window.electronAPI) {
    return (
      <div className="app theme-dark" style={{ padding: 20, color: '#d4d4d4' }}>
        <h3>{t('errors.electronAPINotAvailable')}</h3>
        <p>{t('errors.runWithElectron')}</p>
      </div>
    );
  }

  return (
    <div className={`app theme-${uiTheme}`}>
      {/* 侧边栏 */}
      <Sidebar
        onOpenSettings={() => setPanel('isSettingsOpen', true)}
        onToggleChat={() => togglePanel('isChatOpen')}
        isChatOpen={panels.isChatOpen}
        onToggleTerminal={() => togglePanel('isTerminalOpen')}
        isTerminalOpen={panels.isTerminalOpen}
        onToggleGit={() => togglePanel('showGitPanel')}
        showGitPanel={panels.showGitPanel}
        onToggleSearch={() => togglePanel('isGlobalSearchOpen')}
        isSearchOpen={panels.isGlobalSearchOpen}
        onToggleComposer={() => togglePanel('isComposerOpen')}
        isComposerOpen={panels.isComposerOpen}
        onToggleExtensions={() => togglePanel('isExtensionPanelOpen')}
        isExtensionsOpen={panels.isExtensionPanelOpen}
      />

      {/* 文件浏览器 */}
      <FileExplorer 
        rootPath={currentFolder} 
        onFileSelect={openTab} 
      />
      
      {/* Git 面板 */}
      {panels.showGitPanel && (
        <GitPanel 
          rootPath={currentFolder}
          onFileSelect={openTab}
          onViewDiff={handleViewDiff}
        />
      )}

      {/* 主内容区 */}
      <div className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {!panels.isDiffViewOpen ? (
            <>
              <TabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onTabClick={switchTab}
                onTabClose={closeTab}
              />
              <Editor
                content={fileContent}
                onChange={setFileContent}
                language={activeTab?.language || 'plaintext'}
                theme={editorSettings.theme}
                fontSize={editorSettings.fontSize}
                fontFamily={editorSettings.fontFamily}
                lineHeight={editorSettings.lineHeight}
                filename={activeTab?.filePath}
                completionEnabled={true}
              />
            </>
          ) : diffData && (
            <DiffViewer
              originalContent={diffData.original}
              modifiedContent={diffData.modified}
              originalPath={`HEAD: ${diffData.path}`}
              modifiedPath={`Working: ${diffData.path}`}
              language={detectLanguage(diffData.path)}
              theme={editorSettings.theme === 'vs-dark' || editorSettings.theme === 'hc-black' ? 'vs-dark' : 'light'}
              onClose={() => setPanel('isDiffViewOpen', false)}
            />
          )}
          
          {/* 终端 */}
          {panels.isTerminalOpen && (
            <Terminal
              onClose={() => setPanel('isTerminalOpen', false)}
              workingDirectory={currentFolder || undefined}
            />
          )}
        </div>
      </div>

      {/* 聊天面板 */}
      {panels.isChatOpen && (
        <ChatPanel
          onClose={() => setPanel('isChatOpen', false)}
          currentCode={fileContent}
          onApplyCode={setFileContent}
          theme={uiTheme}
          contextId={activeTab?.filePath || currentFolder || 'default'}
          language={activeTab?.language || 'plaintext'}
        />
      )}

      {/* 设置模态框 */}
      {panels.isSettingsOpen && (
        <SettingsModal
          onClose={() => setPanel('isSettingsOpen', false)}
          onSettingsSaved={handleSettingsSaved}
          currentTheme={uiTheme}
          currentEditorTheme={editorSettings.theme}
        />
      )}

      {/* 快速打开 */}
      <QuickOpenModal
        isOpen={panels.isQuickOpenOpen}
        onClose={() => setPanel('isQuickOpenOpen', false)}
        onFileSelect={openTab}
        rootPath={currentFolder}
      />

      {/* 全局搜索 */}
      <GlobalSearchPanel
        isOpen={panels.isGlobalSearchOpen}
        onClose={() => setPanel('isGlobalSearchOpen', false)}
        onFileOpen={openTab}
        rootPath={currentFolder}
      />
      
      {/* AI Composer */}
      <AIComposer
        isOpen={panels.isComposerOpen}
        onClose={() => setPanel('isComposerOpen', false)}
        rootPath={currentFolder}
        openTabs={tabs.map((t: Tab) => ({ filePath: t.filePath, content: fileContent }))}
        onApplyEdits={(edits) => {
          edits.forEach(edit => {
            const tab = tabs.find((t: Tab) => t.filePath.endsWith(edit.filePath));
            if (tab) {
              window.electronAPI.writeFile(tab.filePath, edit.newContent);
              if (tab.id === activeTabId) {
                setFileContent(edit.newContent);
              }
            }
          });
        }}
      />
      
      {/* 扩展面板 */}
      {panels.isExtensionPanelOpen && (
        <ExtensionPanel
          onClose={() => setPanel('isExtensionPanelOpen', false)}
        />
      )}
    </div>
  );
};

// ==================== 根组件 ====================
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

import React, { useEffect, useState, useCallback } from 'react';
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
import { t } from './i18n';
import './App.css';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickOpenOpen, setIsQuickOpenOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isDiffViewOpen, setIsDiffViewOpen] = useState(false);
  const [isExtensionPanelOpen, setIsExtensionPanelOpen] = useState(false);
  const [diffData, setDiffData] = useState<{original: string; modified: string; path: string} | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [uiTheme, setUiTheme] = useState<'light' | 'dark'>('dark');
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark');
  const [fontSize, setFontSize] = useState<number>(14);
  const [fontFamily, setFontFamily] = useState<string>("'Consolas', 'Monaco', 'Courier New', monospace");
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  
  // 多标签页管理
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [originalContents, setOriginalContents] = useState<Record<string, string>>({});
  
  // 当前活动标签的内容
  const activeTab = tabs.find((t: Tab) => t.id === activeTabId);
  const [fileContent, setFileContent] = useState<string>(t('editor.welcome'));

  // 使用共享的语言检测工具
  const detectLanguageFromPath = useCallback((filePath: string): string => {
    if (!filePath) return 'plaintext';
    const ext = filePath.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      py: 'python', java: 'java', c: 'c', cpp: 'cpp', cc: 'cpp', h: 'c', hpp: 'cpp',
      cs: 'csharp', go: 'go', rs: 'rust', php: 'php', rb: 'ruby', swift: 'swift',
      kt: 'kotlin', html: 'html', css: 'css', scss: 'scss', json: 'json', xml: 'xml',
      md: 'markdown', sql: 'sql', sh: 'shell', yaml: 'yaml', yml: 'yaml',
      vue: 'vue', svelte: 'svelte', dockerfile: 'dockerfile'
    };
    return map[ext || ''] || 'plaintext';
  }, []);

  // 初始配置
  useEffect(() => {
    const loadInitial = async () => {
      if (!window.electronAPI) return;
      const [savedTheme, savedEditorTheme, savedFontSize, savedFontFamily, savedLineHeight, savedLocale] = await Promise.all([
        window.electronAPI.getConfig('ui.theme'),
        window.electronAPI.getConfig('editor.theme'),
        window.electronAPI.getConfig('editor.fontSize'),
        window.electronAPI.getConfig('editor.fontFamily'),
        window.electronAPI.getConfig('editor.lineHeight'),
        window.electronAPI.getConfig('app.locale')
      ]);
      if (savedTheme === 'light' || savedTheme === 'dark') setUiTheme(savedTheme);
      if (typeof savedEditorTheme === 'string') setEditorTheme(savedEditorTheme);
      if (typeof savedFontSize === 'number') setFontSize(savedFontSize);
      if (typeof savedFontFamily === 'string') setFontFamily(savedFontFamily);
      if (typeof savedLineHeight === 'number') setLineHeight(savedLineHeight);
      
      // 加载语言设置
      if (savedLocale === 'zh-CN' || savedLocale === 'en-US') {
        const { setLocale } = await import('./i18n');
        setLocale(savedLocale);
      }
    };
    loadInitial();
  }, []);

  // 监听文件/文件夹
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleFileOpened = async (filePath: string) => {
      console.log('[IPC] file-opened', filePath);
      handleFileSelect(filePath);
    };

    const handleFolderOpened = (folderPath: string) => {
      console.log('[IPC] folder-opened', folderPath);
      setCurrentFolder(folderPath);
      setFileContent(t('editor.folderOpened', folderPath));
    };

    const offFile = window.electronAPI.onFileOpened(handleFileOpened);
    const offFolder = window.electronAPI.onFolderOpened(handleFolderOpened);

    return () => {
      offFile?.();
      offFolder?.();
    };
  }, []);

  // 当活动标签改变时，加载文件内容
  useEffect(() => {
    if (activeTab) {
      window.electronAPI.readFile(activeTab.filePath).then(result => {
        if (result.success) {
          const content = result.data || '';
          setFileContent(content);
          if (originalContents[activeTab.id] === undefined) {
            setOriginalContents(prev => ({ ...prev, [activeTab.id]: content }));
          }
        }
      });
    }
  }, [activeTabId]);
  
  // 监听文件内容变化，更新 isDirty 状态
  useEffect(() => {
    if (activeTabId && activeTab) {
      const originalContent = originalContents[activeTabId];
      if (originalContent !== undefined) {
        const isDirty = fileContent !== originalContent;
        if (activeTab.isDirty !== isDirty) {
          setTabs(prevTabs => prevTabs.map((t: Tab) => 
            t.id === activeTabId ? { ...t, isDirty } : t
          ));
        }
      }
    }
  }, [fileContent, activeTabId, activeTab, originalContents]);
  
  // 监听保存
  useEffect(() => {
    if (!window.electronAPI) return;
    const handleSave = async () => {
      if (activeTab && activeTabId) {
        await window.electronAPI.writeFile(activeTab.filePath, fileContent);
        setOriginalContents(prev => ({ ...prev, [activeTabId]: fileContent }));
        setTabs(tabs.map((t: Tab) => 
          t.id === activeTabId ? { ...t, isDirty: false } : t
        ));
      }
    };
    const offSave = window.electronAPI.onSaveFile(handleSave);
    return () => offSave?.();
  }, [activeTab, fileContent, tabs, activeTabId]);

  const handleSettingsSaved = (opts: any) => {
    if (opts.theme) setUiTheme(opts.theme);
    if (opts.editorTheme) setEditorTheme(opts.editorTheme);
    if (typeof opts.fontSize === 'number') setFontSize(opts.fontSize);
    if (opts.fontFamily) setFontFamily(opts.fontFamily);
    if (typeof opts.lineHeight === 'number') setLineHeight(opts.lineHeight);
  };

  const handleFileSelect = useCallback(async (filePath: string) => {
    // 检查是否已经打开
    const existingTab = tabs.find((t: Tab) => t.filePath === filePath);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }
    
    // 读取文件内容
    const result = await window.electronAPI.readFile(filePath);
    if (result.success) {
      const content = result.data || '';
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        title: filePath.split(/[\\/]/).pop() || filePath,
        filePath,
        isDirty: false,
        language: detectLanguageFromPath(filePath)
      };
      
      setTabs(prevTabs => [...prevTabs, newTab]);
      setActiveTabId(newTab.id);
      setFileContent(content);
      setOriginalContents(prev => ({ ...prev, [newTab.id]: content }));
      
      // 添加到最近文件
      await window.electronAPI.addRecentFile(filePath);
    }
  }, [tabs, detectLanguageFromPath]);

  const handleViewDiff = async (filePath: string) => {
    if (!currentFolder) return;
    
    try {
      // 获取原始文件内容（HEAD 版本）
      const headResult = await window.electronAPI.executeCommand(
        `git show HEAD:"${filePath}"`,
        currentFolder
      );
      
      // 获取当前文件内容
      const fullPath = `${currentFolder}\\${filePath}`;
      const currentResult = await window.electronAPI.readFile(fullPath);
      
      if (headResult.success && currentResult.success) {
        setDiffData({
          original: headResult.output || '',
          modified: currentResult.data || '',
          path: filePath
        });
        setIsDiffViewOpen(true);
      } else {
        alert('Failed to load file diff');
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };
  
  const handleTabClose = async (tabId: string) => {
    const tab = tabs.find((t: Tab) => t.id === tabId);
    if (tab?.isDirty) {
      const confirm = window.confirm(t('tabs.unsavedChanges', tab.title));
      if (!confirm) return;
    }
    
    const newTabs = tabs.filter((t: Tab) => t.id !== tabId);
    setTabs(newTabs);
    
    // 如果关闭的是当前标签，切换到其他标签
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else {
        setActiveTabId(null);
        setFileContent(t('editor.welcome'));
      }
    }
  };

  // 格式化代码
  const handleFormatCode = async () => {
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
  };

  // 全局快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P: Quick Open
      if (e.ctrlKey && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        setIsQuickOpenOpen(true);
      }
      // Ctrl+Shift+F: Global Search
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
      // Ctrl+Shift+C: AI Composer
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsComposerOpen(!isComposerOpen);
      }
      // Ctrl+Shift+G: Toggle Git Panel
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        setShowGitPanel(!showGitPanel);
      }
      // Ctrl+Shift+X: Toggle Extension Panel
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        setIsExtensionPanelOpen(!isExtensionPanelOpen);
      }
      // Ctrl+`: Toggle Terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen(!isTerminalOpen);
      }
      // Shift+Alt+F: Format Code
      if (e.shiftKey && e.altKey && e.key === 'F') {
        e.preventDefault();
        handleFormatCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, isComposerOpen, showGitPanel, isTerminalOpen, isExtensionPanelOpen, activeTab, fileContent]);

  // 调试：确认渲染进程是否正常挂载
  useEffect(() => {
    console.log('[App] mounted');
  }, []);

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
      <Sidebar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        isTerminalOpen={isTerminalOpen}
        onToggleGit={() => setShowGitPanel(!showGitPanel)}
        showGitPanel={showGitPanel}
        onToggleSearch={() => setIsGlobalSearchOpen(!isGlobalSearchOpen)}
        isSearchOpen={isGlobalSearchOpen}
        onToggleComposer={() => setIsComposerOpen(!isComposerOpen)}
        isComposerOpen={isComposerOpen}
        onToggleExtensions={() => setIsExtensionPanelOpen(!isExtensionPanelOpen)}
        isExtensionsOpen={isExtensionPanelOpen}
      />

      <FileExplorer 
        rootPath={currentFolder} 
        onFileSelect={handleFileSelect} 
      />
      
      {showGitPanel && (
        <GitPanel 
          rootPath={currentFolder}
          onFileSelect={handleFileSelect}
          onViewDiff={handleViewDiff}
        />
      )}

      <div className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {!isDiffViewOpen ? (
            <>
              <TabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
              />
              <Editor
                content={fileContent}
                onChange={setFileContent}
                language={activeTab?.language || 'plaintext'}
                theme={editorTheme}
                fontSize={fontSize}
                fontFamily={fontFamily}
                lineHeight={lineHeight}
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
              language={detectLanguageFromPath(diffData.path)}
              theme={editorTheme === 'vs-dark' || editorTheme === 'hc-black' ? 'vs-dark' : 'light'}
              onClose={() => setIsDiffViewOpen(false)}
            />
          )}
          
          {isTerminalOpen && (
            <Terminal
              onClose={() => setIsTerminalOpen(false)}
              workingDirectory={currentFolder || undefined}
            />
          )}
        </div>
      </div>

      {isChatOpen && (
        <ChatPanel
          onClose={() => setIsChatOpen(false)}
          currentCode={fileContent}
          onApplyCode={setFileContent}
          theme={uiTheme}
          contextId={activeTab?.filePath || currentFolder || 'default'}
          language={activeTab?.language || 'plaintext'}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onSettingsSaved={handleSettingsSaved}
          currentTheme={uiTheme}
          currentEditorTheme={editorTheme}
        />
      )}

      <QuickOpenModal
        isOpen={isQuickOpenOpen}
        onClose={() => setIsQuickOpenOpen(false)}
        onFileSelect={handleFileSelect}
        rootPath={currentFolder}
      />

      <GlobalSearchPanel
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onFileOpen={(filePath) => handleFileSelect(filePath)}
        rootPath={currentFolder}
      />
      
      <AIComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        rootPath={currentFolder}
        openTabs={tabs.map((t: Tab) => ({ filePath: t.filePath, content: fileContent }))}
        onApplyEdits={(edits) => {
          edits.forEach(edit => {
            const tab = tabs.find((t: Tab) => t.filePath.endsWith(edit.filePath));
            if (tab) {
              // 更新标签内容
              window.electronAPI.writeFile(tab.filePath, edit.newContent);
              if (tab.id === activeTabId) {
                setFileContent(edit.newContent);
              }
            }
          });
        }}
      />
      
      {isExtensionPanelOpen && (
        <ExtensionPanel
          onClose={() => setIsExtensionPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

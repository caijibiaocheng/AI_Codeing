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
import RecentFilesModal from './components/RecentFilesModal';
import GlobalSearchPanel from './components/GlobalSearchPanel';
import TabBar, { Tab } from './components/TabBar';
import GitPanel from './components/GitPanel';
import AIComposer from './components/AIComposer';
import AIAssistantPanel from './components/AIAssistantPanel';
import MarkdownPreview from './components/MarkdownPreview';
import DiffViewer from './components/DiffViewer';
import Terminal from './components/Terminal';
import ExtensionPanel from './components/ExtensionPanel';
import TodoPanel from './components/TodoPanel';
import GitStashPanel from './components/GitStashPanel';
import ToolsPanel from './components/ToolsPanel';
import SnippetPanel from './components/SnippetPanel';
import BookmarkPanel from './components/BookmarkPanel';
import CodeMetricsPanel from './components/CodeMetricsPanel';
import StatusBar from './components/StatusBar';
import Breadcrumb from './components/Breadcrumb';
import CommandPalette from './components/CommandPalette';
import NotificationSystem from './components/NotificationSystem';
import QuickActions from './components/QuickActions';
import Layout from './components/Layout';
import RecentFilesPanel from './components/RecentFilesPanel';
import OutlinePanel from './components/OutlinePanel';
import ProblemsPanel from './components/ProblemsPanel';
import ProjectTemplatesPanel from './components/ProjectTemplatesPanel';
import KeyBindingsManager from './components/KeyBindingsManager';
import EnvironmentManager from './components/EnvironmentManager';

// Context & Hooks
import { AppProvider, useApp, usePanels, useEditorSettings, useCurrentFolder } from './contexts';
import { useTabs } from './hooks';

// Utils & i18n
import { detectLanguage } from './utils';
import { t } from './i18n';

import './App.css';
import './components/StatusBar.css';
import './components/Breadcrumb.css';
import './components/CommandPalette.css';
import './components/NotificationSystem.css';
import './components/QuickActions.css';
import './components/EnhancedSidebar.css';
import './components/LoadingSpinner.css';
import './components/SplashScreen.css';
import './components/Layout.css';
import './components/RecentFilesPanel.css';
import './components/OutlinePanel.css';
import './components/ProblemsPanel.css';
import './components/ProjectTemplatesPanel.css';
import './components/KeyBindingsManager.css';
import './components/EnvironmentManager.css';

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

  // Git 状态数据
  const [gitStatus, setGitStatus] = useState<{
    branch?: string;
    status?: string;
    ahead?: number;
    behind?: number;
  } | null>(null);

  // 光标位置
  const [cursorPosition, setCursorPosition] = useState({
    line: 1,
    column: 1
  });

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

  // 显示欢迎通知
  useEffect(() => {
    if (window.notificationSystem) {
      setTimeout(() => {
        window.notificationSystem.success(
          '欢迎使用 AI 代码编辑器！',
          '按 Ctrl+Shift+P 打开命令面板，体验全新功能',
          {
            duration: 6000,
            actions: [
              {
                label: '了解新功能',
                primary: true,
                action: () => {
                  window.notificationSystem.info(
                    '新功能介绍',
                    '✨ 状态栏：显示文件信息、Git状态、光标位置\n🧭 面包屑导航：快速导航文件路径\n⚡ 命令面板：Ctrl+Shift+P 快速执行命令\n🔔 通知系统：实时反馈操作结果\n⚡ 快速操作栏：编辑器右上角快捷按钮'
                  );
                }
              }
            ]
          }
        );
      }, 1000);
    }
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

  // 获取Git状态
  useEffect(() => {
    if (!currentFolder || !window.electronAPI) return;

    const fetchGitStatus = async () => {
      try {
        const result = await window.electronAPI.executeCommand('git status --porcelain -b', currentFolder);
        if (result.success) {
          const lines = result.output.split('\n');
          const branchLine = lines.find(line => line.startsWith('##'));
          const statusLines = lines.filter(line => line && !line.startsWith('##'));
          
          let branch = 'main';
          let status = statusLines.join('\n');
          
          if (branchLine) {
            const match = branchLine.match(/## (.+?)(?:\.\.\..+?)?(?: \[(.+?)\])?/);
            if (match) {
              branch = match[1];
              if (match[2]) {
                status = status + ' ' + match[2];
              }
            }
          }
          
          setGitStatus({ branch, status });
        }
      } catch (error) {
        console.error('[Git] Failed to fetch status:', error);
      }
    };

    fetchGitStatus();
    const interval = setInterval(fetchGitStatus, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, [currentFolder]);

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
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setPanel('isCommandPaletteOpen', true);
      }
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        setPanel('isRecentFilesOpen', true);
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
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        togglePanel('isAIAssistantOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        if (activeTab?.language === 'markdown') {
          togglePanel('isMarkdownPreviewOpen');
        }
      }
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        togglePanel('isTerminalOpen');
      }
      if (e.shiftKey && e.altKey && e.key === 'F') {
        e.preventDefault();
        handleFormatCode();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        togglePanel('isTodoPanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        togglePanel('isGitStashPanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        togglePanel('isToolsPanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        togglePanel('isSnippetPanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        togglePanel('isBookmarkPanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        togglePanel('isCodeMetricsPanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        togglePanel('isRecentFilesPanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        togglePanel('isOutlinePanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        togglePanel('isProblemsPanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        togglePanel('isProjectTemplatesPanelOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        togglePanel('isKeyBindingsManagerOpen');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        togglePanel('isEnvironmentManagerOpen');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel, setPanel, handleFormatCode, activeTab]);

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
        onToggleAIAssistant={() => togglePanel('isAIAssistantOpen')}
        isAIAssistantOpen={panels.isAIAssistantOpen}
        onToggleTodo={() => togglePanel('isTodoPanelOpen')}
        isTodoOpen={panels.isTodoPanelOpen}
        onToggleGitStash={() => togglePanel('isGitStashPanelOpen')}
        isGitStashOpen={panels.isGitStashPanelOpen}
        onToggleTools={() => togglePanel('isToolsPanelOpen')}
        isToolsOpen={panels.isToolsPanelOpen}
        onToggleSnippets={() => togglePanel('isSnippetPanelOpen')}
        isSnippetsOpen={panels.isSnippetPanelOpen}
        onToggleBookmarks={() => togglePanel('isBookmarkPanelOpen')}
        isBookmarksOpen={panels.isBookmarkPanelOpen}
        onToggleCodeMetrics={() => togglePanel('isCodeMetricsPanelOpen')}
        isCodeMetricsOpen={panels.isCodeMetricsPanelOpen}
        onToggleRecentFiles={() => togglePanel('isRecentFilesPanelOpen')}
        isRecentFilesOpen={panels.isRecentFilesPanelOpen}
        onToggleOutline={() => togglePanel('isOutlinePanelOpen')}
        isOutlineOpen={panels.isOutlinePanelOpen}
        onToggleProblems={() => togglePanel('isProblemsPanelOpen')}
        isProblemsOpen={panels.isProblemsPanelOpen}
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
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* 面包屑导航 */}
          <Breadcrumb
            filePath={activeTab?.filePath}
            workspaceRoot={currentFolder}
            onNavigate={(path) => {
              // 这里可以添加导航逻辑
              console.log('Navigate to:', path);
            }}
            theme={uiTheme}
          />

          {!panels.isDiffViewOpen ? (
            <>
              <TabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onTabClick={switchTab}
                onTabClose={closeTab}
              />
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                <div style={{ flex: panels.isMarkdownPreviewOpen && activeTab?.language === 'markdown' ? '1 1 50%' : '1', overflow: 'hidden', position: 'relative' }}>
                  {/* 快速操作栏 */}
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                    <QuickActions
                      actions={[
                        {
                          id: 'save',
                          icon: '💾',
                          title: '保存文件 (Ctrl+S)',
                          onClick: saveActiveTab
                        },
                        {
                          id: 'format',
                          icon: '✨',
                          title: '格式化代码 (Shift+Alt+F)',
                          onClick: handleFormatCode
                        },
                        {
                          id: 'command',
                          icon: '⚡',
                          title: '命令面板 (Ctrl+Shift+P)',
                          onClick: () => setPanel('isCommandPaletteOpen', true)
                        }
                      ]}
                      theme={uiTheme}
                    />
                  </div>
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
                </div>
                {panels.isMarkdownPreviewOpen && activeTab?.language === 'markdown' && (
                  <MarkdownPreview
                    content={fileContent}
                    onClose={() => setPanel('isMarkdownPreviewOpen', false)}
                  />
                )}
              </div>
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

          {/* 状态栏 */}
          <StatusBar
            currentFilePath={activeTab?.filePath}
            cursorPosition={cursorPosition}
            language={activeTab?.language}
            gitBranch={gitStatus?.branch}
            gitStatus={gitStatus?.status}
            theme={uiTheme}
          />
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
      
      {/* 代码片段面板 */}
      {panels.isSnippetPanelOpen && (
        <div className="side-panel">
          <SnippetPanel
            onInsertSnippet={(code) => {
              if (activeTab) {
                setFileContent(fileContent + '\n' + code);
              }
            }}
          />
        </div>
      )}
      
      {/* 书签面板 */}
      {panels.isBookmarkPanelOpen && (
        <div className="side-panel">
          <BookmarkPanel
            currentFilePath={activeTab?.filePath}
            onNavigateToBookmark={(filePath, line) => {
              openTab(filePath);
              // TODO: 跳转到指定行
            }}
          />
        </div>
      )}
      
      {/* 代码度量面板 */}
      {panels.isCodeMetricsPanelOpen && (
        <div className="side-panel">
          <CodeMetricsPanel
            workspacePath={currentFolder}
          />
        </div>
      )}
      
      {/* 最近文件面板 */}
      {panels.isRecentFilesPanelOpen && (
        <RecentFilesPanel
          onClose={() => setPanel('isRecentFilesPanelOpen', false)}
          onFileSelect={openTab}
          currentFile={activeTab?.filePath}
        />
      )}
      
      {/* 大纲面板 */}
      {panels.isOutlinePanelOpen && (
        <OutlinePanel
          onClose={() => setPanel('isOutlinePanelOpen', false)}
          filePath={activeTab?.filePath}
          fileContent={fileContent}
          language={activeTab?.language}
          onNavigate={(line, column) => {
            // TODO: 实现跳转到指定行列
            console.log(`Navigate to line ${line}, column ${column}`);
            if (window.notificationSystem) {
              window.notificationSystem.info('跳转', `第 ${line} 行，第 ${column} 列`);
            }
          }}
        />
      )}
      
      {/* 问题面板 */}
      {panels.isProblemsPanelOpen && (
        <ProblemsPanel
          onClose={() => setPanel('isProblemsPanelOpen', false)}
          onProblemClick={(problem) => {
            openTab(problem.file);
            // TODO: 跳转到问题所在行
            console.log(`Navigate to ${problem.file}:${problem.line}:${problem.column}`);
          }}
          currentFile={activeTab?.filePath}
        />
      )}

      {/* 项目模板面板 */}
      {panels.isProjectTemplatesPanelOpen && (
        <ProjectTemplatesPanel
          onClose={() => setPanel('isProjectTemplatesPanelOpen', false)}
        />
      )}

      {/* 快捷键管理面板 */}
      {panels.isKeyBindingsManagerOpen && (
        <KeyBindingsManager
          onClose={() => setPanel('isKeyBindingsManagerOpen', false)}
        />
      )}

      {/* 环境变量管理面板 */}
      {panels.isEnvironmentManagerOpen && (
        <EnvironmentManager
          onClose={() => setPanel('isEnvironmentManagerOpen', false)}
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
      
      {/* 最近文件 */}
      <RecentFilesModal
        isOpen={panels.isRecentFilesOpen}
        onClose={() => setPanel('isRecentFilesOpen', false)}
        onFileSelect={openTab}
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
      
      {/* AI 助手面板 */}
      {panels.isAIAssistantOpen && (
        <AIAssistantPanel
          code={fileContent}
          language={activeTab?.language || 'plaintext'}
          filePath={activeTab?.filePath}
          onClose={() => setPanel('isAIAssistantOpen', false)}
        />
      )}
      
      {/* TODO 面板 */}
      {panels.isTodoPanelOpen && (
        <TodoPanel
          rootPath={currentFolder}
          onClose={() => setPanel('isTodoPanelOpen', false)}
          onFileOpen={(filePath, line) => {
            openTab(filePath);
            // TODO: 跳转到指定行
          }}
        />
      )}
      
      {/* Git Stash 面板 */}
      {panels.isGitStashPanelOpen && (
        <GitStashPanel
          rootPath={currentFolder}
          onClose={() => setPanel('isGitStashPanelOpen', false)}
        />
      )}
      
      {/* 开发工具面板 */}
      {panels.isToolsPanelOpen && (
        <ToolsPanel
          onClose={() => setPanel('isToolsPanelOpen', false)}
        />
      )}

      {/* 命令面板 */}
      <CommandPalette
        isOpen={panels.isCommandPaletteOpen || false}
        onClose={() => setPanel('isCommandPaletteOpen', false)}
        commands={[
          {
            id: 'file.new',
            title: '新建文件',
            description: '创建一个新的文件',
            icon: '📄',
            category: '文件',
            action: () => {
              if (window.notificationSystem) {
                window.notificationSystem.info('新建文件', '功能开发中...');
              }
            }
          },
          {
            id: 'file.save',
            title: '保存文件',
            description: '保存当前文件',
            icon: '💾',
            category: '文件',
            action: saveActiveTab
          },
          {
            id: 'edit.format',
            title: '格式化代码',
            description: '格式化当前文件的代码',
            icon: '✨',
            category: '编辑',
            action: handleFormatCode
          },
          {
            id: 'view.terminal',
            title: '切换终端',
            description: '显示或隐藏终端',
            icon: '⌨️',
            category: '视图',
            action: () => togglePanel('isTerminalOpen')
          },
          {
            id: 'view.settings',
            title: '打开设置',
            description: '打开编辑器设置',
            icon: '⚙️',
            category: '视图',
            action: () => setPanel('isSettingsOpen', true)
          },
          {
            id: 'git.status',
            title: 'Git 状态',
            description: '查看Git状态',
            icon: '🔀',
            category: 'Git',
            action: () => togglePanel('showGitPanel')
          },
          {
            id: 'ai.chat',
            title: 'AI 聊天',
            description: '打开AI聊天面板',
            icon: '💬',
            category: 'AI',
            action: () => togglePanel('isChatOpen')
          },
          {
            id: 'tools.templates',
            title: '项目模板',
            description: '打开项目模板管理器',
            icon: '📁',
            category: '工具',
            action: () => togglePanel('isProjectTemplatesPanelOpen')
          },
          {
            id: 'tools.keybindings',
            title: '快捷键管理',
            description: '管理键盘快捷键',
            icon: '⌨️',
            category: '工具',
            action: () => togglePanel('isKeyBindingsManagerOpen')
          },
          {
            id: 'tools.environment',
            title: '环境变量管理',
            description: '管理环境变量配置',
            icon: '🌍',
            category: '工具',
            action: () => togglePanel('isEnvironmentManagerOpen')
          }
        ]}
        theme={uiTheme}
      />

      {/* 通知系统 */}
      <NotificationSystem theme={uiTheme} />
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

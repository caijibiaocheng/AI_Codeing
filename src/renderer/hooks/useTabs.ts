/**
 * Tab 管理 Hook
 * 处理多标签页的状态管理
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { detectLanguage } from '../utils/language';

export interface Tab {
  id: string;
  title: string;
  filePath: string;
  isDirty: boolean;
  language: string;
}

export interface UseTabsReturn {
  tabs: Tab[];
  activeTabId: string | null;
  activeTab: Tab | undefined;
  fileContent: string;
  originalContents: Record<string, string>;
  setFileContent: (content: string) => void;
  openTab: (filePath: string) => Promise<void>;
  closeTab: (tabId: string) => Promise<boolean>;
  switchTab: (tabId: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  saveActiveTab: () => Promise<boolean>;
}

export function useTabs(defaultContent: string = ''): UseTabsReturn {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>(defaultContent);
  const [originalContents, setOriginalContents] = useState<Record<string, string>>({});
  
  const contentCacheRef = useRef<Record<string, string>>({});
  
  const activeTab = tabs.find(t => t.id === activeTabId);

  // 当活动标签改变时，加载文件内容
  useEffect(() => {
    if (!activeTab || !window.electronAPI) return;
    
    // 先检查缓存
    if (contentCacheRef.current[activeTab.id] !== undefined) {
      setFileContent(contentCacheRef.current[activeTab.id]);
      return;
    }
    
    // 从文件系统加载
    window.electronAPI.readFile(activeTab.filePath).then(result => {
      if (result.success) {
        const content = result.data || '';
        setFileContent(content);
        contentCacheRef.current[activeTab.id] = content;
        
        if (originalContents[activeTab.id] === undefined) {
          setOriginalContents(prev => ({ ...prev, [activeTab.id]: content }));
        }
      }
    });
  }, [activeTabId, activeTab?.filePath]);

  // 监听内容变化，更新缓存和 dirty 状态
  useEffect(() => {
    if (!activeTabId || !activeTab) return;
    
    contentCacheRef.current[activeTabId] = fileContent;
    
    const originalContent = originalContents[activeTabId];
    if (originalContent !== undefined) {
      const isDirty = fileContent !== originalContent;
      if (activeTab.isDirty !== isDirty) {
        setTabs(prevTabs => prevTabs.map(t => 
          t.id === activeTabId ? { ...t, isDirty } : t
        ));
      }
    }
  }, [fileContent, activeTabId, originalContents]);

  // 打开标签页
  const openTab = useCallback(async (filePath: string) => {
    // 检查是否已打开
    const existingTab = tabs.find(t => t.filePath === filePath);
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
        language: detectLanguage(filePath),
      };
      
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      setFileContent(content);
      contentCacheRef.current[newTab.id] = content;
      setOriginalContents(prev => ({ ...prev, [newTab.id]: content }));
      
      // 添加到最近文件
      await window.electronAPI.addRecentFile(filePath);
    }
  }, [tabs]);

  // 关闭标签页
  const closeTab = useCallback(async (tabId: string): Promise<boolean> => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isDirty) {
      const confirmed = window.confirm(`文件 "${tab.title}" 有未保存的更改，确定要关闭吗？`);
      if (!confirmed) return false;
    }
    
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    // 清理缓存
    delete contentCacheRef.current[tabId];
    setOriginalContents(prev => {
      const { [tabId]: _, ...rest } = prev;
      return rest;
    });
    
    // 如果关闭的是当前标签，切换到其他标签
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else {
        setActiveTabId(null);
        setFileContent(defaultContent);
      }
    }
    
    return true;
  }, [tabs, activeTabId, defaultContent]);

  // 切换标签页
  const switchTab = useCallback((tabId: string) => {
    // 保存当前标签的内容到缓存
    if (activeTabId) {
      contentCacheRef.current[activeTabId] = fileContent;
    }
    setActiveTabId(tabId);
  }, [activeTabId, fileContent]);

  // 标记标签页为 dirty
  const markTabDirty = useCallback((tabId: string, isDirty: boolean) => {
    setTabs(prevTabs => prevTabs.map(t => 
      t.id === tabId ? { ...t, isDirty } : t
    ));
  }, []);

  // 保存当前标签页
  const saveActiveTab = useCallback(async (): Promise<boolean> => {
    if (!activeTab || !activeTabId) return false;
    
    try {
      await window.electronAPI.writeFile(activeTab.filePath, fileContent);
      setOriginalContents(prev => ({ ...prev, [activeTabId]: fileContent }));
      setTabs(prevTabs => prevTabs.map(t => 
        t.id === activeTabId ? { ...t, isDirty: false } : t
      ));
      return true;
    } catch (error) {
      console.error('[useTabs] Failed to save file:', error);
      return false;
    }
  }, [activeTab, activeTabId, fileContent]);

  return {
    tabs,
    activeTabId,
    activeTab,
    fileContent,
    originalContents,
    setFileContent,
    openTab,
    closeTab,
    switchTab,
    markTabDirty,
    saveActiveTab,
  };
}

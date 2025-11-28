import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import NotificationSystem from './NotificationSystem';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';

interface LayoutProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  currentFilePath?: string;
  workspaceRoot?: string;
  cursorPosition?: { line: number; column: number };
  language?: string;
  gitBranch?: string;
  gitStatus?: string;
  onBreadcrumbNavigate?: (path: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  theme = 'dark',
  currentFilePath,
  workspaceRoot,
  cursorPosition = { line: 1, column: 1 },
  language,
  gitBranch,
  gitStatus,
  onBreadcrumbNavigate
}) => {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 检查是否是首次加载
    const hasVisited = localStorage.getItem('editor-has-visited');
    if (hasVisited) {
      setShowSplash(false);
      setIsReady(true);
    } else {
      localStorage.setItem('editor-has-visited', 'true');
      // 显示启动画面3秒后自动隐藏
      setTimeout(() => {
        setIsReady(true);
      }, 3000);
    }
  }, []);

  const handleSplashReady = () => {
    setIsReady(true);
    setTimeout(() => setShowSplash(false), 300);
  };

  if (!isReady) {
    return (
      <SplashScreen 
        onReady={handleSplashReady} 
        theme={theme}
      />
    );
  }

  return (
    <div className={`app-layout theme-${theme}`}>
      {/* 通知系统 */}
      <NotificationSystem theme={theme} />
      
      {/* 主要内容 */}
      <div className="app-main">
        {/* 面包屑导航 */}
        <Breadcrumb
          filePath={currentFilePath}
          workspaceRoot={workspaceRoot}
          onNavigate={onBreadcrumbNavigate}
          theme={theme}
        />
        
        {/* 应用内容 */}
        <div className="app-content">
          {children}
        </div>
        
        {/* 状态栏 */}
        <StatusBar
          currentFilePath={currentFilePath}
          cursorPosition={cursorPosition}
          language={language}
          gitBranch={gitBranch}
          gitStatus={gitStatus}
          theme={theme}
        />
      </div>
      
      {/* 启动画面（淡出中） */}
      {showSplash && (
        <SplashScreen 
          onReady={handleSplashReady} 
          theme={theme}
        />
      )}
    </div>
  );
};

export default Layout;
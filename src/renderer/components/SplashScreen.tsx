import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SplashScreenProps {
  onReady: () => void;
  theme?: 'light' | 'dark';
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onReady, theme = 'dark' }) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const stages = [
    '初始化编辑器...',
    '加载用户配置...',
    '准备工作空间...',
    '启动AI服务...',
    '就绪！'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingStage(prev => {
        if (prev >= stages.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onReady, 300);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(timer);
  }, [onReady, stages.length]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''} theme-${theme}`}>
      <div className="splash-content">
        {/* Logo区域 */}
        <div className="splash-logo">
          <div className="logo-icon">🤖</div>
          <h1 className="logo-title">AI Code Editor</h1>
          <div className="logo-subtitle">智能编程，效率倍增</div>
        </div>

        {/* 加载进度 */}
        <div className="splash-loading">
          <LoadingSpinner size="large" theme={theme} />
          <div className="loading-text">{stages[loadingStage]}</div>
          <div className="loading-progress">
            <div 
              className="loading-progress-bar" 
              style={{ width: `${((loadingStage + 1) / stages.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 版本信息 */}
        <div className="splash-footer">
          <div className="version-info">v2.0.0</div>
          <div className="tech-stack">
            <span>Electron</span>
            <span>•</span>
            <span>React</span>
            <span>•</span>
            <span>Monaco</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
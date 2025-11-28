import React from 'react';

interface BreadcrumbProps {
  filePath?: string;
  workspaceRoot?: string;
  onNavigate?: (path: string) => void;
  theme?: 'light' | 'dark';
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  filePath,
  workspaceRoot,
  onNavigate,
  theme = 'dark'
}) => {
  if (!filePath) {
    return (
      <div className="breadcrumb">
        <span className="breadcrumb-item">欢迎使用 AI 代码编辑器</span>
      </div>
    );
  }

  // 标准化路径分隔符
  const normalizePath = (path: string) => path.replace(/\\/g, '/');
  
  const normalizedFilePath = normalizePath(filePath || '');
  const normalizedRoot = normalizePath(workspaceRoot || '');
  
  // 获取相对于工作区的路径
  let relativePath = normalizedFilePath;
  if (normalizedRoot && normalizedFilePath.startsWith(normalizedRoot)) {
    relativePath = normalizedFilePath.substring(normalizedRoot.length);
  }
  
  // 分割路径
  const parts = relativePath.split('/').filter(part => part.length > 0);
  
  const handlePartClick = (index: number) => {
    if (!onNavigate || !filePath) return;
    
    let targetPath = filePath;
    if (index < parts.length) {
      const isWindows = filePath.includes('\\');
      const separator = isWindows ? '\\' : '/';
      const rootPath = workspaceRoot || (isWindows ? filePath.split('\\')[0] + '\\' : '/');
      const targetParts = parts.slice(0, index + 1);
      targetPath = rootPath + separator + targetParts.join(separator);
    }
    
    onNavigate(targetPath);
  };

  return (
    <div className="breadcrumb">
      {/* 工作区根目录 */}
      {workspaceRoot && (
        <>
          <span 
            className="breadcrumb-item clickable"
            onClick={() => onNavigate?.(workspaceRoot)}
            title={workspaceRoot}
          >
            📁 {workspaceRoot.split(/[/\\]/).pop() || '根目录'}
          </span>
          <span className="breadcrumb-separator">›</span>
        </>
      )}
      
      {/* 路径部分 */}
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="breadcrumb-separator">›</span>}
          <span 
            className={`breadcrumb-item ${index === parts.length - 1 ? 'current' : 'clickable'}`}
            onClick={() => index === parts.length - 1 ? undefined : handlePartClick(index)}
            title={part}
          >
            {index === parts.length - 1 && parts.length > 1 ? '📄 ' : ''}
            {part}
          </span>
        </React.Fragment>
      ))}
      
      {/* 快速操作按钮 */}
      <div className="breadcrumb-actions">
        <button 
          className="breadcrumb-action"
          onClick={() => {
            if (filePath) {
              navigator.clipboard.writeText(filePath);
            }
          }}
          title="复制文件路径"
        >
          📋
        </button>
        <button 
          className="breadcrumb-action"
          onClick={() => {
            if (filePath) {
              const folder = filePath.substring(0, filePath.lastIndexOf(/[/\\]/.test(filePath) ? filePath.match(/[/\\]/)![0] : '/'));
              onNavigate?.(folder);
            }
          }}
          title="在文件管理器中显示"
        >
          📂
        </button>
      </div>
    </div>
  );
};

export default Breadcrumb;
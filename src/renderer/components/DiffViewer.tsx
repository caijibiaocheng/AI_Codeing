import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import './DiffViewer.css';

interface DiffViewerProps {
  originalContent: string;
  modifiedContent: string;
  originalPath?: string;
  modifiedPath?: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
  onClose: () => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  originalContent,
  modifiedContent,
  originalPath = 'Original',
  modifiedPath = 'Modified',
  language = 'plaintext',
  theme = 'vs-dark',
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建 Diff Editor
    const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
      theme,
      automaticLayout: true,
      readOnly: true,
      renderSideBySide: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      renderLineHighlight: 'all',
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible'
      }
    });

    // 创建模型
    const originalModel = monaco.editor.createModel(originalContent, language);
    const modifiedModel = monaco.editor.createModel(modifiedContent, language);

    // 设置模型
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel
    });

    diffEditorRef.current = diffEditor;

    // 清理函数
    return () => {
      originalModel.dispose();
      modifiedModel.dispose();
      diffEditor.dispose();
    };
  }, [originalContent, modifiedContent, language, theme]);

  // 更新内容
  useEffect(() => {
    if (!diffEditorRef.current) return;

    const model = diffEditorRef.current.getModel();
    if (model) {
      model.original.setValue(originalContent);
      model.modified.setValue(modifiedContent);
    }
  }, [originalContent, modifiedContent]);

  // 更新主题
  useEffect(() => {
    if (diffEditorRef.current) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  return (
    <div className="diff-viewer">
      <div className="diff-viewer-header">
        <div className="diff-viewer-title">
          <span className="diff-label original">📄 {originalPath}</span>
          <span className="diff-separator">↔️</span>
          <span className="diff-label modified">📝 {modifiedPath}</span>
        </div>
        <button className="diff-viewer-close" onClick={onClose} title="Close diff view">
          ✕
        </button>
      </div>
      <div className="diff-viewer-container" ref={containerRef}></div>
    </div>
  );
};

export default DiffViewer;

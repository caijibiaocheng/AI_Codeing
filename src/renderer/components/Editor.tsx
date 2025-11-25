import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as monaco from 'monaco-editor';
import InlineCompletion from './InlineCompletion';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  language: string;
  theme: string;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  filename?: string;
  completionEnabled?: boolean;
}

const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  language, 
  theme,
  fontSize = 14,
  fontFamily = "'Consolas', 'Monaco', 'Courier New', monospace",
  lineHeight = 1.5,
  filename,
  completionEnabled = true
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const changeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromPropRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const [editorInstance, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const debouncedOnChange = useCallback((value: string) => {
    if (changeTimerRef.current) {
      clearTimeout(changeTimerRef.current);
    }
    
    changeTimerRef.current = setTimeout(() => {
      onChangeRef.current(value);
    }, 300);
  }, []);

  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: content,
        language: language,
        theme: theme || 'vs-dark',
        automaticLayout: true,
        fontSize: fontSize,
        fontFamily: fontFamily,
        lineHeight: lineHeight,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      });

      setEditorInstance(monacoEditorRef.current);

      monacoEditorRef.current.onDidChangeModelContent(() => {
        if (!isUpdatingFromPropRef.current) {
          const value = monacoEditorRef.current?.getValue() || '';
          debouncedOnChange(value);
        }
      });
    }

    return () => {
      if (changeTimerRef.current) {
        clearTimeout(changeTimerRef.current);
      }
      monacoEditorRef.current?.dispose();
      monacoEditorRef.current = null;
      setEditorInstance(null);
    };
  }, []);

  useEffect(() => {
    if (monacoEditorRef.current && monacoEditorRef.current.getValue() !== content) {
      isUpdatingFromPropRef.current = true;
      monacoEditorRef.current.setValue(content);
      setTimeout(() => {
        isUpdatingFromPropRef.current = false;
      }, 0);
    }
  }, [content]);

  useEffect(() => {
    if (theme) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({
        fontSize: fontSize,
        fontFamily: fontFamily,
        lineHeight: lineHeight
      });
    }
  }, [fontSize, fontFamily, lineHeight]);

  return (
    <>
      <div ref={editorRef} style={{ width: '100%', height: '100%' }} />
      <InlineCompletion
        editor={editorInstance}
        enabled={completionEnabled}
        language={language}
        filename={filename}
      />
    </>
  );
};

export default Editor;

import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';

interface InlineCompletionProps {
  editor: monaco.editor.IStandaloneCodeEditor | null;
  enabled: boolean;
  language: string;
  filename?: string;
}

const InlineCompletion: React.FC<InlineCompletionProps> = ({ 
  editor, 
  enabled, 
  language,
  filename 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentCompletion, setCurrentCompletion] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const lastRequestRef = useRef<{ position: number; content: string } | null>(null);

  useEffect(() => {
    if (!editor || !enabled) {
      clearDecorations();
      return;
    }

    // 监听内容变化
    const disposable = editor.onDidChangeModelContent(() => {
      handleContentChange();
    });

    // 监听光标位置变化
    const cursorDisposable = editor.onDidChangeCursorPosition(() => {
      // 如果光标移动，清除当前补全
      if (currentCompletion) {
        clearDecorations();
        setCurrentCompletion(null);
      }
    });

    // 监听键盘事件（Tab 键接受补全）
    const keyDisposable = editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Tab && currentCompletion) {
        e.preventDefault();
        e.stopPropagation();
        acceptCompletion();
      } else if (e.keyCode === monaco.KeyCode.Escape && currentCompletion) {
        e.preventDefault();
        clearDecorations();
        setCurrentCompletion(null);
      }
    });

    return () => {
      disposable.dispose();
      cursorDisposable.dispose();
      keyDisposable.dispose();
      clearDecorations();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [editor, enabled, currentCompletion]);

  const handleContentChange = () => {
    if (!editor || !enabled) return;

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 清除当前补全
    clearDecorations();
    setCurrentCompletion(null);

    // 设置新的延迟触发
    debounceTimerRef.current = setTimeout(() => {
      requestCompletion();
    }, 800); // 800ms 延迟
  };

  const requestCompletion = async () => {
    if (!editor || !window.electronAPI) return;

    const model = editor.getModel();
    if (!model) return;

    const position = editor.getPosition();
    if (!position) return;

    const offset = model.getOffsetAt(position);
    const content = model.getValue();

    // 避免重复请求
    if (
      lastRequestRef.current &&
      lastRequestRef.current.position === offset &&
      lastRequestRef.current.content === content
    ) {
      return;
    }

    lastRequestRef.current = { position: offset, content };

    // 获取光标前后的代码
    const prefix = content.substring(0, offset);
    const suffix = content.substring(offset);

    // 如果前缀太短，不触发补全
    if (prefix.trim().length < 10) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await window.electronAPI.aiGetCompletion({
        code: content,
        cursorPosition: offset,
        language,
        filename,
        prefix,
        suffix
      });

      if (result.success && result.completion) {
        setCurrentCompletion(result.completion);
        showCompletion(result.completion, position);
      }
    } catch (error) {
      console.error('[InlineCompletion] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showCompletion = (completion: string, position: monaco.Position) => {
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    // 创建装饰器显示灰色的补全文本
    const decorations = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        options: {
          after: {
            content: completion,
            inlineClassName: 'inline-completion-suggestion'
          }
        }
      }
    ]);

    decorationsRef.current = decorations;
  };

  const acceptCompletion = () => {
    if (!editor || !currentCompletion) return;

    const position = editor.getPosition();
    if (!position) return;

    // 插入补全文本
    editor.executeEdits('inline-completion', [
      {
        range: new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        text: currentCompletion
      }
    ]);

    // 移动光标到补全文本末尾
    const lines = currentCompletion.split('\n');
    const lastLine = lines[lines.length - 1];
    const newPosition = new monaco.Position(
      position.lineNumber + lines.length - 1,
      lines.length === 1 ? position.column + lastLine.length : lastLine.length + 1
    );
    editor.setPosition(newPosition);

    // 清除补全
    clearDecorations();
    setCurrentCompletion(null);
  };

  const clearDecorations = () => {
    if (!editor) return;
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
  };

  return null; // 这是一个逻辑组件，不渲染任何 UI
};

export default InlineCompletion;

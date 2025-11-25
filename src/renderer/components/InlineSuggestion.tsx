import React, { useState, useEffect, useCallback, useRef } from 'react';
import './InlineSuggestion.css';

interface InlineSuggestionProps {
  editorRef: any;
  currentCode: string;
  language: string;
  cursorPosition: { lineNumber: number; column: number };
  onAccept: (suggestion: string) => void;
}

const InlineSuggestion: React.FC<InlineSuggestionProps> = ({
  editorRef,
  currentCode,
  language,
  cursorPosition,
  onAccept
}) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<string>('');

  // 获取 AI 建议
  const fetchSuggestion = useCallback(async (code: string, position: { lineNumber: number; column: number }) => {
    if (!code.trim() || isLoading) return;

    const requestKey = `${code}-${position.lineNumber}-${position.column}`;
    if (requestKey === lastRequestRef.current) return;
    lastRequestRef.current = requestKey;

    setIsLoading(true);
    
    try {
      // 获取当前行和上下文
      const lines = code.split('\n');
      const currentLine = lines[position.lineNumber - 1] || '';
      const prefix = currentLine.substring(0, position.column - 1);
      const context = lines.slice(Math.max(0, position.lineNumber - 10), position.lineNumber).join('\n');

      const prompt = `You are an AI code completion assistant. Based on the context, suggest the next code completion.

Language: ${language}
Context:
\`\`\`
${context}
\`\`\`

Current line prefix: "${prefix}"

Provide ONLY the completion text (no explanations, no markdown). The completion should:
1. Continue from where the cursor is
2. Be a single line or multi-line completion
3. Match the coding style and indentation
4. Be syntactically correct

Completion:`;

      const result = await window.electronAPI.aiChat(prompt, { 
        code: context,
        language,
        temperature: 0.3 // 低温度以获得更确定性的建议
      });

      if (result.success && result.data) {
        // 清理 AI 响应
        let cleanSuggestion = result.data
          .replace(/```[\w]*\n?/g, '') // 移除代码块标记
          .replace(/^Completion:\s*/i, '')
          .trim();

        // 只保留第一行或前几行
        const suggestionLines = cleanSuggestion.split('\n');
        if (suggestionLines.length > 3) {
          cleanSuggestion = suggestionLines.slice(0, 3).join('\n');
        }

        setSuggestion(cleanSuggestion);
      }
    } catch (error) {
      console.error('Failed to fetch suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  }, [language, isLoading]);

  // 防抖处理
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // 只在用户停止输入 500ms 后请求建议
    debounceTimer.current = setTimeout(() => {
      if (currentCode && cursorPosition) {
        fetchSuggestion(currentCode, cursorPosition);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [currentCode, cursorPosition, fetchSuggestion]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && suggestion && !e.shiftKey) {
        e.preventDefault();
        onAccept(suggestion);
        setSuggestion('');
      } else if (e.key === 'Escape') {
        setSuggestion('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestion, onAccept]);

  // 在编辑器中显示 ghost text
  useEffect(() => {
    if (!editorRef.current || !suggestion) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // 创建装饰器显示 ghost text
    const position = editor.getPosition();
    const decorations = editor.deltaDecorations([], [
      {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        options: {
          after: {
            content: suggestion.split('\n')[0], // 只显示第一行
            inlineClassName: 'inline-suggestion-ghost-text'
          }
        }
      }
    ]);

    return () => {
      editor.deltaDecorations(decorations, []);
    };
  }, [editorRef, suggestion]);

  return null; // 这是一个无 UI 的组件，通过装饰器显示建议
};

export default InlineSuggestion;

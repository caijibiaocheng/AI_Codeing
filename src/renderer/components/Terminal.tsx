import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Terminal.css';

interface TerminalProps {
  onClose: () => void;
  workingDirectory?: string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

const MAX_LINES = 500; // 最大行数限制

const Terminal: React.FC<TerminalProps> = ({ onClose, workingDirectory = '' }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: `AI Code Editor Terminal`, timestamp: new Date() },
    { type: 'output', content: `Working directory: ${workingDirectory || 'Not set'}`, timestamp: new Date() },
    { type: 'output', content: '', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (terminalRef.current) {
      requestAnimationFrame(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      });
    }
  }, [lines.length]);

  // 确保输入框始终聚焦
  useEffect(() => {
    if (!isExecuting && inputRef.current) {
      // 延迟聚焦，确保 DOM 已更新
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isExecuting, lines.length]);

  // 点击终端body时聚焦输入框
  const handleTerminalClick = useCallback(() => {
    if (!isExecuting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExecuting]);

  const addLines = useCallback((newLines: TerminalLine[]) => {
    setLines(prev => {
      const updated = [...prev, ...newLines];
      // 限制最大行数，保留最新的行
      if (updated.length > MAX_LINES) {
        return updated.slice(updated.length - MAX_LINES);
      }
      return updated;
    });
  }, []);

  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    // 添加命令到历史
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // 显示输入的命令
    addLines([{ 
      type: 'input', 
      content: `$ ${command}`, 
      timestamp: new Date() 
    }]);

    setIsExecuting(true);
    setInput('');

    try {
      // 特殊命令处理
      if (command === 'clear') {
        setLines([]);
        setIsExecuting(false);
        return;
      }

      if (command === 'help') {
        setLines(prev => [...prev, 
          { type: 'output', content: 'Available commands:', timestamp: new Date() },
          { type: 'output', content: '', timestamp: new Date() },
          { type: 'output', content: 'Built-in commands:', timestamp: new Date() },
          { type: 'output', content: '  help         - Show this help message', timestamp: new Date() },
          { type: 'output', content: '  clear        - Clear terminal', timestamp: new Date() },
          { type: 'output', content: '  exit         - Close terminal', timestamp: new Date() },
          { type: 'output', content: '', timestamp: new Date() },
          { type: 'output', content: 'File commands:', timestamp: new Date() },
          { type: 'output', content: '  dir          - List directory contents (Windows)', timestamp: new Date() },
          { type: 'output', content: '  ls           - List directory contents (Git Bash)', timestamp: new Date() },
          { type: 'output', content: '  cd <path>    - Change directory', timestamp: new Date() },
          { type: 'output', content: '', timestamp: new Date() },
          { type: 'output', content: 'NPM commands:', timestamp: new Date() },
          { type: 'output', content: '  npm install  - Install dependencies', timestamp: new Date() },
          { type: 'output', content: '  npm start    - Start application', timestamp: new Date() },
          { type: 'output', content: '  npm run dev  - Start dev server', timestamp: new Date() },
          { type: 'output', content: '  npm run build - Build project', timestamp: new Date() },
          { type: 'output', content: '', timestamp: new Date() },
          { type: 'output', content: 'Git commands:', timestamp: new Date() },
          { type: 'output', content: '  git status   - Check git status', timestamp: new Date() },
          { type: 'output', content: '  git add .    - Stage all changes', timestamp: new Date() },
          { type: 'output', content: '  git commit -m "msg" - Commit changes', timestamp: new Date() },
          { type: 'output', content: '  git push     - Push to remote', timestamp: new Date() },
          { type: 'output', content: '', timestamp: new Date() }
        ]);
        setIsExecuting(false);
        return;
      }

      if (command === 'exit') {
        onClose();
        return;
      }

      // 执行实际命令 (通过 IPC)
      const result = await window.electronAPI.executeCommand(command, workingDirectory);
      
      if (result.success) {
        if (result.output) {
          // 批量添加行，而不是逐行添加（性能优化）
          const outputLines = result.output.split('\n').map((line: string) => ({
            type: 'output' as const,
            content: line,
            timestamp: new Date()
          }));
          addLines(outputLines);
        }
      } else {
        addLines([{ 
          type: 'error', 
          content: result.error || 'Command failed', 
          timestamp: new Date() 
        }]);
      }
    } catch (error: any) {
      addLines([{ 
        type: 'error', 
        content: `Error: ${error.message}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsExecuting(false);
      addLines([{ type: 'output', content: '', timestamp: new Date() }]);
    }
  }, [addLines, workingDirectory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setInput('');
      addLines([{ 
        type: 'output', 
        content: '^C', 
        timestamp: new Date() 
      }]);
    }
  }, [commandHistory, historyIndex, input, executeCommand, addLines]);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
        <div className="terminal-actions">
          <button onClick={() => setLines([])} className="terminal-btn" title="Clear">
            🗑️
          </button>
          <button onClick={onClose} className="terminal-btn" title="Close">
            ×
          </button>
        </div>
      </div>

      <div className="terminal-body" ref={terminalRef} onClick={handleTerminalClick}>
        {lines.map((line, idx) => (
          <div key={`${idx}-${line.timestamp.getTime()}`} className={`terminal-line terminal-line-${line.type}`}>
            {line.content}
          </div>
        ))}
        
        {!isExecuting && (
          <div className="terminal-input-line">
            <span className="terminal-prompt">$</span>
            <input
              ref={inputRef}
              type="text"
              className="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              autoFocus
              disabled={isExecuting}
            />
          </div>
        )}

        {isExecuting && (
          <div className="terminal-loading">
            <span className="terminal-spinner">⠋</span> Executing...
          </div>
        )}
      </div>

      <div className="terminal-footer">
        <span className="terminal-hint">
          Press <kbd>↑</kbd>/<kbd>↓</kbd> for history | <kbd>Ctrl+C</kbd> to cancel | Type <code>help</code> for commands
        </span>
      </div>
    </div>
  );
};

export default Terminal;

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { t } from '../i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  onClose: () => void;
  currentCode: string;
  onApplyCode?: (code: string) => void;
  theme: 'light' | 'dark';
  contextId?: string;
  language?: string;
}

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('python', python);

const ChatPanel: React.FC<ChatPanelProps> = ({ onClose, currentCode, onApplyCode, theme, contextId = 'default', language = 'plaintext' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [toast, setToast] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAssistantMessageRef = useRef('');
  const streamIdRef = useRef(0);
  const storageKey = useMemo(() => `chat-messages-${contextId}`, [contextId]);

  const isAPIAvailable = typeof window !== 'undefined' && window.electronAPI;

  useEffect(() => {
    if (!isAPIAvailable) return;
    const cached = window.localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Message[];
        setMessages(parsed);
      } catch {
        // ignore invalid cache
      }
    }
  }, [storageKey, isAPIAvailable]);

  useEffect(() => {
    if (!isAPIAvailable) return;
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey, isAPIAvailable]);

  useEffect(() => {
    if (!isAPIAvailable) return;
    const unsubscribe = window.electronAPI.onStreamChunk((chunk: string) => {
      const streamId = streamIdRef.current;
      currentAssistantMessageRef.current += chunk;
      setMessages(prev => {
        // ignore late chunks if streaming was stopped
        if (streamId !== streamIdRef.current) {
          return prev;
        }
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === 'assistant') {
          newMessages[newMessages.length - 1].content = currentAssistantMessageRef.current;
        } else {
          newMessages.push({ role: 'assistant', content: currentAssistantMessageRef.current });
        }
        return newMessages;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isAPIAvailable]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast('Copied to clipboard');
      setTimeout(() => setToast(''), 1500);
    } catch {
      setToast('Copy failed, please try again');
      setTimeout(() => setToast(''), 2000);
    }
  }, []);

  const codeStyle = theme === 'dark' ? vscDarkPlus : vs;

  const CodeBlock = useCallback(({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode[] }) => {
    const language = /language-(\w+)/.exec(className || '')?.[1] || '';
    const code = String(children).replace(/\n$/, '');

    if (inline) {
      return <code className="inline-code">{code}</code>;
    }

    return (
      <div className="code-block-container">
        <div className="code-block-header">
          <span className="language-tag">{language || 'code'}</span>
          <div className="code-actions">
            <button onClick={() => copyToClipboard(code)} className="code-action-btn">Copy</button>
            {onApplyCode && (
              <button onClick={() => onApplyCode(code)} className="code-action-btn">Apply</button>
            )}
          </div>
        </div>
        <SyntaxHighlighter
          language={language || 'tsx'}
          style={codeStyle}
          wrapLongLines
          customStyle={{ margin: 0, borderRadius: '0 0 8px 8px' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }, [codeStyle, onApplyCode, copyToClipboard]);

  const markdownComponents: Components = useMemo(() => ({
    code: CodeBlock
  }), [CodeBlock]);

  const handleSend = async (messageOverride?: string) => {
    const text = messageOverride ?? input;
    if (!text.trim() || isLoading) return;

    const userMessage = text;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setIsStreaming(true);
    currentAssistantMessageRef.current = '';
    streamIdRef.current += 1;
    const thisStreamId = streamIdRef.current;

    try {
      const result = await window.electronAPI.aiStreamChat(userMessage, {
        code: currentCode,
        language: language
      });

      if (!result.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${result.error || 'Failed to get response'}` 
        }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}` 
      }]);
    } finally {
      if (thisStreamId === streamIdRef.current) {
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  };

  const handleStop = () => {
    streamIdRef.current += 1; // invalidate current stream
    setIsLoading(false);
    setIsStreaming(false);
  };

  const handleRetry = () => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      void handleSend(lastUser.content);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    currentAssistantMessageRef.current = '';
    window.localStorage.removeItem(storageKey);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAPIAvailable) {
    return (
      <div className="chat-panel">
        <div className="chat-header">
          <h3>{t('chat.title')}</h3>
          <button className="chat-close" onClick={onClose}>×</button>
        </div>
        <div className="chat-messages" style={{ padding: 16 }}>
          <div className="message assistant">
            <div className="message-content">
              electronAPI 不可用，聊天功能被禁用。
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>{t('chat.title')}</h3>
        <div className="chat-actions">
          <button className="chat-mini-btn" onClick={handleNewChat} title={t('chat.title')}>New</button>
          <button className="chat-mini-btn" onClick={() => handleRetry()} title="Retry">Retry</button>
          <button className="chat-mini-btn" onClick={handleStop} disabled={!isStreaming} title="Stop streaming">Stop</button>
          <button className="chat-close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask AI anything..."
          disabled={isLoading}
        />
        <button 
          className="chat-send" 
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default ChatPanel;

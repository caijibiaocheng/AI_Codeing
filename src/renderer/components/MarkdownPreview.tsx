import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './MarkdownPreview.css';

interface MarkdownPreviewProps {
  content: string;
  onClose: () => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, onClose }) => {
  return (
    <div className="markdown-preview-panel">
      <div className="markdown-preview-header">
        <h3>Markdown Preview</h3>
        <button className="markdown-preview-close" onClick={onClose}>×</button>
      </div>
      <div className="markdown-preview-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownPreview;

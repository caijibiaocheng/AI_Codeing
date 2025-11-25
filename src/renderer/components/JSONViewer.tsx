import React, { useState, useEffect } from 'react';
import './JSONViewer.css';

interface JSONViewerProps {
  onClose: () => void;
}

const JSONViewer: React.FC<JSONViewerProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [formatted, setFormatted] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);
  const [stats, setStats] = useState({ lines: 0, size: 0, keys: 0 });

  useEffect(() => {
    formatJSON();
  }, [input, indent]);

  const formatJSON = () => {
    setError(null);
    
    if (!input.trim()) {
      setFormatted('');
      setStats({ lines: 0, size: 0, keys: 0 });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formattedStr = JSON.stringify(parsed, null, indent);
      setFormatted(formattedStr);

      // Calculate stats
      const lines = formattedStr.split('\n').length;
      const size = new Blob([formattedStr]).size;
      const keys = countKeys(parsed);
      setStats({ lines, size, keys });
    } catch (err: any) {
      setError(err.message);
      setFormatted('');
      setStats({ lines: 0, size: 0, keys: 0 });
    }
  };

  const countKeys = (obj: any): number => {
    if (typeof obj !== 'object' || obj === null) return 0;
    
    let count = 0;
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        count += countKeys(item);
      });
    } else {
      count = Object.keys(obj).length;
      Object.values(obj).forEach(value => {
        count += countKeys(value);
      });
    }
    return count;
  };

  const minifyJSON = () => {
    if (!input.trim()) return;
    
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyFormatted = async () => {
    if (formatted) {
      try {
        await navigator.clipboard.writeText(formatted);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const loadSample = () => {
    const sample = {
      name: 'John Doe',
      age: 30,
      email: 'john.doe@example.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
        zipCode: '10001'
      },
      hobbies: ['reading', 'coding', 'traveling'],
      active: true,
      balance: 1234.56,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      }
    };
    setInput(JSON.stringify(sample, null, 2));
  };

  const clearAll = () => {
    setInput('');
    setFormatted('');
    setError(null);
    setStats({ lines: 0, size: 0, keys: 0 });
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="json-viewer-panel">
      <div className="json-viewer-header">
        <h3>JSON Formatter & Viewer</h3>
        <div className="json-viewer-actions">
          <button className="json-viewer-btn json-viewer-btn-secondary" onClick={loadSample}>
            Load Sample
          </button>
          <button className="json-viewer-btn json-viewer-btn-secondary" onClick={clearAll}>
            Clear
          </button>
          <button className="json-viewer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div className="json-toolbar">
        <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          Indent:
        </label>
        <select
          className="json-indent-select"
          value={indent}
          onChange={(e) => setIndent(parseInt(e.target.value))}
        >
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="8">8 spaces</option>
        </select>
        <button className="json-viewer-btn json-viewer-btn-secondary" onClick={minifyJSON}>
          Minify
        </button>
        <button
          className="json-viewer-btn json-viewer-btn-secondary"
          onClick={copyFormatted}
          disabled={!formatted}
        >
          Copy Formatted
        </button>
      </div>

      <div className="json-viewer-content">
        {/* Editor Pane */}
        <div className="json-editor-pane">
          <div className="json-pane-header">Input JSON</div>
          <div className="json-pane-content">
            <textarea
              className="json-input"
              placeholder="Paste or type your JSON here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        {/* Viewer Pane */}
        <div className="json-viewer-pane">
          <div className="json-pane-header">Formatted Output</div>
          <div className="json-pane-content">
            {error ? (
              <div className="json-error">
                <strong>Invalid JSON:</strong> {error}
              </div>
            ) : formatted ? (
              <div className="json-output">
                <pre>{formatted}</pre>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>
                Enter valid JSON in the left pane to see formatted output
              </div>
            )}
          </div>
        </div>
      </div>

      {formatted && (
        <div className="json-stats">
          <div className="json-stat">
            <span className="json-stat-label">Lines:</span>
            <span className="json-stat-value">{stats.lines}</span>
          </div>
          <div className="json-stat">
            <span className="json-stat-label">Size:</span>
            <span className="json-stat-value">{formatSize(stats.size)}</span>
          </div>
          <div className="json-stat">
            <span className="json-stat-label">Keys:</span>
            <span className="json-stat-value">{stats.keys}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JSONViewer;

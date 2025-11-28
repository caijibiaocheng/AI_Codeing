/**
 * Outline Panel - 文件大纲面板
 * 显示当前文件的符号结构（函数、类、接口等）
 */
import React, { useState, useEffect } from 'react';

interface OutlineSymbol {
  name: string;
  kind: string;
  line: number;
  column: number;
  children?: OutlineSymbol[];
}

interface OutlinePanelProps {
  onClose: () => void;
  filePath?: string;
  fileContent?: string;
  language?: string;
  onNavigate?: (line: number, column: number) => void;
}

const OutlinePanel: React.FC<OutlinePanelProps> = ({
  onClose,
  filePath,
  fileContent,
  language,
  onNavigate
}) => {
  const [symbols, setSymbols] = useState<OutlineSymbol[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fileContent && language) {
      parseSymbols();
    } else {
      setSymbols([]);
    }
  }, [fileContent, language, filePath]);

  const parseSymbols = () => {
    setLoading(true);
    try {
      const parsed = parseCodeStructure(fileContent || '', language || '');
      setSymbols(parsed);
    } catch (error) {
      console.error('[OutlinePanel] Failed to parse symbols:', error);
      setSymbols([]);
    } finally {
      setLoading(false);
    }
  };

  const parseCodeStructure = (code: string, lang: string): OutlineSymbol[] => {
    const lines = code.split('\n');
    const symbols: OutlineSymbol[] = [];

    if (lang === 'typescript' || lang === 'javascript' || lang === 'tsx' || lang === 'jsx') {
      lines.forEach((line, index) => {
        // 匹配类
        const classMatch = line.match(/^\s*(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/);
        if (classMatch) {
          symbols.push({
            name: classMatch[1],
            kind: 'class',
            line: index + 1,
            column: line.indexOf(classMatch[1]) + 1,
            children: []
          });
        }

        // 匹配接口
        const interfaceMatch = line.match(/^\s*(?:export\s+)?interface\s+(\w+)/);
        if (interfaceMatch) {
          symbols.push({
            name: interfaceMatch[1],
            kind: 'interface',
            line: index + 1,
            column: line.indexOf(interfaceMatch[1]) + 1
          });
        }

        // 匹配函数
        const functionMatch = line.match(/^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
        if (functionMatch) {
          symbols.push({
            name: functionMatch[1],
            kind: 'function',
            line: index + 1,
            column: line.indexOf(functionMatch[1]) + 1
          });
        }

        // 匹配箭头函数和const函数
        const arrowMatch = line.match(/^\s*(?:export\s+)?const\s+(\w+)\s*[:=]\s*(?:async\s+)?\([^)]*\)\s*=>/);
        if (arrowMatch) {
          symbols.push({
            name: arrowMatch[1],
            kind: 'function',
            line: index + 1,
            column: line.indexOf(arrowMatch[1]) + 1
          });
        }

        // 匹配React组件
        const componentMatch = line.match(/^\s*(?:export\s+)?const\s+(\w+):\s*React\.FC/);
        if (componentMatch) {
          symbols.push({
            name: componentMatch[1],
            kind: 'component',
            line: index + 1,
            column: line.indexOf(componentMatch[1]) + 1
          });
        }

        // 匹配方法
        const methodMatch = line.match(/^\s+(\w+)\s*\([^)]*\)\s*[:{]/);
        if (methodMatch && symbols.length > 0 && symbols[symbols.length - 1].kind === 'class') {
          const lastClass = symbols[symbols.length - 1];
          if (!lastClass.children) lastClass.children = [];
          lastClass.children.push({
            name: methodMatch[1],
            kind: 'method',
            line: index + 1,
            column: line.indexOf(methodMatch[1]) + 1
          });
        }

        // 匹配枚举
        const enumMatch = line.match(/^\s*(?:export\s+)?enum\s+(\w+)/);
        if (enumMatch) {
          symbols.push({
            name: enumMatch[1],
            kind: 'enum',
            line: index + 1,
            column: line.indexOf(enumMatch[1]) + 1
          });
        }

        // 匹配类型别名
        const typeMatch = line.match(/^\s*(?:export\s+)?type\s+(\w+)/);
        if (typeMatch) {
          symbols.push({
            name: typeMatch[1],
            kind: 'type',
            line: index + 1,
            column: line.indexOf(typeMatch[1]) + 1
          });
        }
      });
    } else if (lang === 'python') {
      lines.forEach((line, index) => {
        // 匹配类
        const classMatch = line.match(/^\s*class\s+(\w+)/);
        if (classMatch) {
          symbols.push({
            name: classMatch[1],
            kind: 'class',
            line: index + 1,
            column: line.indexOf(classMatch[1]) + 1,
            children: []
          });
        }

        // 匹配函数
        const functionMatch = line.match(/^\s*def\s+(\w+)/);
        if (functionMatch) {
          if (symbols.length > 0 && symbols[symbols.length - 1].kind === 'class' && line.startsWith('    ')) {
            const lastClass = symbols[symbols.length - 1];
            if (!lastClass.children) lastClass.children = [];
            lastClass.children.push({
              name: functionMatch[1],
              kind: 'method',
              line: index + 1,
              column: line.indexOf(functionMatch[1]) + 1
            });
          } else {
            symbols.push({
              name: functionMatch[1],
              kind: 'function',
              line: index + 1,
              column: line.indexOf(functionMatch[1]) + 1
            });
          }
        }
      });
    }

    return symbols;
  };

  const getSymbolIcon = (kind: string): string => {
    const iconMap: Record<string, string> = {
      'class': '🏛️',
      'interface': '📋',
      'function': '⚡',
      'method': '🔧',
      'component': '⚛️',
      'enum': '📊',
      'type': '🔤',
      'variable': '📦',
      'constant': '💎'
    };
    return iconMap[kind] || '📄';
  };

  const toggleExpand = (symbolName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(symbolName)) {
      newExpanded.delete(symbolName);
    } else {
      newExpanded.add(symbolName);
    }
    setExpandedItems(newExpanded);
  };

  const handleSymbolClick = (symbol: OutlineSymbol) => {
    if (onNavigate) {
      onNavigate(symbol.line, symbol.column);
    }
    if (window.notificationSystem) {
      window.notificationSystem.info('导航', `跳转到第 ${symbol.line} 行`);
    }
  };

  const filterSymbols = (symbolList: OutlineSymbol[]): OutlineSymbol[] => {
    if (!filter) return symbolList;
    
    return symbolList.filter(symbol => {
      const matchesName = symbol.name.toLowerCase().includes(filter.toLowerCase());
      const hasMatchingChild = symbol.children?.some(child => 
        child.name.toLowerCase().includes(filter.toLowerCase())
      );
      return matchesName || hasMatchingChild;
    });
  };

  const renderSymbol = (symbol: OutlineSymbol, level: number = 0) => {
    const hasChildren = symbol.children && symbol.children.length > 0;
    const isExpanded = expandedItems.has(symbol.name);
    const indent = level * 16;

    return (
      <div key={`${symbol.name}-${symbol.line}`} className="outline-symbol">
        <div
          className="symbol-item"
          style={{ paddingLeft: `${8 + indent}px` }}
          onClick={() => handleSymbolClick(symbol)}
        >
          {hasChildren && (
            <button
              className="expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(symbol.name);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <span className="symbol-icon">{getSymbolIcon(symbol.kind)}</span>
          <span className="symbol-name">{symbol.name}</span>
          <span className="symbol-kind">{symbol.kind}</span>
          <span className="symbol-line">{symbol.line}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="symbol-children">
            {symbol.children!.map(child => renderSymbol(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredSymbols = filterSymbols(symbols);

  return (
    <div className="side-panel outline-panel">
      <div className="panel-header">
        <h3>
          <span style={{ marginRight: '8px' }}>🗂️</span>
          大纲
        </h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-toolbar">
        <input
          type="text"
          className="filter-input"
          placeholder="搜索符号..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="panel-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner">⏳</div>
            <p>解析中...</p>
          </div>
        ) : !filePath ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p>请打开一个文件</p>
          </div>
        ) : filteredSymbols.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>{filter ? '没有匹配的符号' : '未找到符号'}</p>
            <small>支持 TypeScript、JavaScript、Python</small>
          </div>
        ) : (
          <div className="outline-list">
            {filteredSymbols.map(symbol => renderSymbol(symbol))}
          </div>
        )}
      </div>

      <div className="panel-footer">
        <div className="info-text">
          {filteredSymbols.length > 0 ? `${filteredSymbols.length} 个符号` : '无符号'}
        </div>
      </div>
    </div>
  );
};

export default OutlinePanel;

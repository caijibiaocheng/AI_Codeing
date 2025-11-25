import React, { useState } from 'react';
import './CodeAnalysisPanel.css';

interface CodeAnalysisPanelProps {
  onClose: () => void;
}

interface AnalysisIssue {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule: string;
}

interface AnalysisResult {
  issues: AnalysisIssue[];
  stats: {
    errors: number;
    warnings: number;
    info: number;
    lines: number;
    complexity: number;
  };
}

// 基础代码分析规则
const analyzeCode = (code: string, language: string): AnalysisResult => {
  const issues: AnalysisIssue[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // 通用规则
    // 1. 行太长
    if (line.length > 120) {
      issues.push({
        line: lineNum,
        column: 121,
        severity: 'warning',
        message: `Line exceeds 120 characters (${line.length})`,
        rule: 'max-line-length'
      });
    }
    
    // 2. 尾随空格
    if (/\s+$/.test(line) && line.trim().length > 0) {
      issues.push({
        line: lineNum,
        column: line.trimEnd().length + 1,
        severity: 'info',
        message: 'Trailing whitespace detected',
        rule: 'no-trailing-spaces'
      });
    }
    
    // 3. console.log 检测
    if (/console\.(log|debug|info|warn|error)\s*\(/.test(line)) {
      issues.push({
        line: lineNum,
        column: line.indexOf('console') + 1,
        severity: 'warning',
        message: 'Unexpected console statement',
        rule: 'no-console'
      });
    }
    
    // 4. debugger 语句
    if (/\bdebugger\b/.test(line)) {
      issues.push({
        line: lineNum,
        column: line.indexOf('debugger') + 1,
        severity: 'error',
        message: 'Unexpected debugger statement',
        rule: 'no-debugger'
      });
    }
    
    // 5. TODO/FIXME 注释
    const todoMatch = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX):/i);
    if (todoMatch) {
      issues.push({
        line: lineNum,
        column: line.indexOf(todoMatch[1]) + 1,
        severity: 'info',
        message: `${todoMatch[1]} comment found`,
        rule: 'no-warning-comments'
      });
    }
    
    // JavaScript/TypeScript 特定规则
    if (['javascript', 'typescript', 'javascriptreact', 'typescriptreact'].includes(language)) {
      // 6. var 使用
      if (/\bvar\s+\w+/.test(line)) {
        issues.push({
          line: lineNum,
          column: line.indexOf('var') + 1,
          severity: 'warning',
          message: 'Unexpected var, use let or const instead',
          rule: 'no-var'
        });
      }
      
      // 7. == 而不是 ===
      if (/[^=!]==[^=]/.test(line) && !/===/.test(line)) {
        issues.push({
          line: lineNum,
          column: line.indexOf('==') + 1,
          severity: 'warning',
          message: 'Expected === instead of ==',
          rule: 'eqeqeq'
        });
      }
      
      // 8. != 而不是 !==
      if (/!=[^=]/.test(line) && !/!==/.test(line)) {
        issues.push({
          line: lineNum,
          column: line.indexOf('!=') + 1,
          severity: 'warning',
          message: 'Expected !== instead of !=',
          rule: 'eqeqeq'
        });
      }
      
      // 9. 空 catch 块
      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
        issues.push({
          line: lineNum,
          column: line.indexOf('catch') + 1,
          severity: 'warning',
          message: 'Empty catch block',
          rule: 'no-empty'
        });
      }
      
      // 10. alert 使用
      if (/\balert\s*\(/.test(line)) {
        issues.push({
          line: lineNum,
          column: line.indexOf('alert') + 1,
          severity: 'warning',
          message: 'Unexpected alert statement',
          rule: 'no-alert'
        });
      }
    }
    
    // Python 特定规则
    if (language === 'python') {
      // 缩进检查
      const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
      if (leadingSpaces > 0 && leadingSpaces % 4 !== 0 && line.trim().length > 0) {
        issues.push({
          line: lineNum,
          column: 1,
          severity: 'warning',
          message: 'Indentation is not a multiple of 4',
          rule: 'indentation'
        });
      }
      
      // print 语句
      if (/\bprint\s*\(/.test(line)) {
        issues.push({
          line: lineNum,
          column: line.indexOf('print') + 1,
          severity: 'info',
          message: 'Print statement found (consider using logging)',
          rule: 'no-print'
        });
      }
    }
  });
  
  // 计算复杂度 (简化版)
  const complexity = calculateComplexity(code);
  
  return {
    issues,
    stats: {
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
      lines: lines.length,
      complexity
    }
  };
};

// 简化的圈复杂度计算
const calculateComplexity = (code: string): number => {
  let complexity = 1;
  
  // 条件语句
  complexity += (code.match(/\bif\b/g) || []).length;
  complexity += (code.match(/\belse\s+if\b/g) || []).length;
  complexity += (code.match(/\bcase\b/g) || []).length;
  
  // 循环
  complexity += (code.match(/\bfor\b/g) || []).length;
  complexity += (code.match(/\bwhile\b/g) || []).length;
  complexity += (code.match(/\bdo\b/g) || []).length;
  
  // 逻辑运算符
  complexity += (code.match(/&&/g) || []).length;
  complexity += (code.match(/\|\|/g) || []).length;
  
  // 三元运算符
  complexity += (code.match(/\?[^?]/g) || []).length;
  
  // catch 块
  complexity += (code.match(/\bcatch\b/g) || []).length;
  
  return complexity;
};

const SAMPLE_CODE = `// Sample code for analysis
function processData(data) {
  var result = [];  // Using var
  
  if (data == null) {  // Using ==
    console.log("Data is null");
    return result;
  }
  
  for (var i = 0; i < data.length; i++) {
    if (data[i].active == true) {
      result.push(data[i]);
    }
  }
  
  // TODO: Add error handling
  try {
    JSON.parse(data);
  } catch (e) {}  // Empty catch
  
  debugger;  // Debug statement
  alert("Done!");  // Alert
  
  return result;
}`;

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'other', label: 'Other' },
];

const CodeAnalysisPanel: React.FC<CodeAnalysisPanelProps> = ({ onClose }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const handleAnalyze = () => {
    if (!code.trim()) return;
    const analysisResult = analyzeCode(code, language);
    setResult(analysisResult);
  };

  const loadSample = () => {
    setCode(SAMPLE_CODE);
    setLanguage('javascript');
  };

  const clearAll = () => {
    setCode('');
    setResult(null);
  };

  const filteredIssues = result?.issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.severity === filter;
  }) || [];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  const getComplexityLevel = (complexity: number) => {
    if (complexity <= 5) return { label: 'Low', class: 'low' };
    if (complexity <= 10) return { label: 'Medium', class: 'medium' };
    if (complexity <= 20) return { label: 'High', class: 'high' };
    return { label: 'Very High', class: 'very-high' };
  };

  return (
    <div className="code-analysis-panel">
      <div className="code-analysis-header">
        <h3>Code Analysis</h3>
        <div className="code-analysis-actions">
          <button className="analysis-btn secondary" onClick={loadSample}>
            Load Sample
          </button>
          <button className="analysis-btn secondary" onClick={clearAll}>
            Clear
          </button>
          <button className="analysis-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div className="code-analysis-toolbar">
        <select
          className="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
        <button 
          className="analysis-btn primary"
          onClick={handleAnalyze}
          disabled={!code.trim()}
        >
          🔍 Analyze Code
        </button>
      </div>

      <div className="code-analysis-content">
        <div className="code-input-section">
          <div className="section-header">Code Input</div>
          <textarea
            className="code-input"
            placeholder="Paste your code here for analysis..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {result && (
          <div className="analysis-results-section">
            <div className="section-header">Analysis Results</div>
            
            {/* Stats */}
            <div className="analysis-stats">
              <div className="stat-item errors">
                <span className="stat-icon">❌</span>
                <span className="stat-value">{result.stats.errors}</span>
                <span className="stat-label">Errors</span>
              </div>
              <div className="stat-item warnings">
                <span className="stat-icon">⚠️</span>
                <span className="stat-value">{result.stats.warnings}</span>
                <span className="stat-label">Warnings</span>
              </div>
              <div className="stat-item info">
                <span className="stat-icon">ℹ️</span>
                <span className="stat-value">{result.stats.info}</span>
                <span className="stat-label">Info</span>
              </div>
              <div className="stat-item lines">
                <span className="stat-icon">📄</span>
                <span className="stat-value">{result.stats.lines}</span>
                <span className="stat-label">Lines</span>
              </div>
              <div className={`stat-item complexity ${getComplexityLevel(result.stats.complexity).class}`}>
                <span className="stat-icon">📊</span>
                <span className="stat-value">{result.stats.complexity}</span>
                <span className="stat-label">Complexity ({getComplexityLevel(result.stats.complexity).label})</span>
              </div>
            </div>

            {/* Filter */}
            <div className="analysis-filter">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({result.issues.length})
              </button>
              <button 
                className={`filter-btn error ${filter === 'error' ? 'active' : ''}`}
                onClick={() => setFilter('error')}
              >
                Errors ({result.stats.errors})
              </button>
              <button 
                className={`filter-btn warning ${filter === 'warning' ? 'active' : ''}`}
                onClick={() => setFilter('warning')}
              >
                Warnings ({result.stats.warnings})
              </button>
              <button 
                className={`filter-btn info ${filter === 'info' ? 'active' : ''}`}
                onClick={() => setFilter('info')}
              >
                Info ({result.stats.info})
              </button>
            </div>

            {/* Issues List */}
            <div className="issues-list">
              {filteredIssues.length === 0 ? (
                <div className="no-issues">
                  {result.issues.length === 0 
                    ? '✅ No issues found! Your code looks clean.'
                    : 'No issues match the current filter.'}
                </div>
              ) : (
                filteredIssues.map((issue, index) => (
                  <div key={index} className={`issue-item ${issue.severity}`}>
                    <div className="issue-header">
                      <span className="issue-icon">{getSeverityIcon(issue.severity)}</span>
                      <span className="issue-location">Line {issue.line}:{issue.column}</span>
                      <span className="issue-rule">{issue.rule}</span>
                    </div>
                    <div className="issue-message">{issue.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeAnalysisPanel;

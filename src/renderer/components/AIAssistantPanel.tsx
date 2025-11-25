import React, { useState } from 'react';
import './AIAssistantPanel.css';

interface AIAssistantPanelProps {
  code: string;
  language: string;
  filePath?: string;
  onClose: () => void;
}

type TabType = 'review' | 'test' | 'docs' | 'explain' | 'refactor';

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  code,
  language,
  filePath,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('review');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reviewResults, setReviewResults] = useState<CodeReviewResult[] | null>(null);
  const [testResult, setTestResult] = useState<TestGenerationResult | null>(null);
  const [docsResult, setDocsResult] = useState<DocumentationResult | null>(null);
  const [explanationResult, setExplanationResult] = useState<CodeExplanationResult | null>(null);
  const [refactoringSuggestions, setRefactoringSuggestions] = useState<RefactoringSuggestion[] | null>(null);

  const hasCode = code && code.trim().length > 0;

  const handleReviewCode = async () => {
    if (!hasCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.electronAPI.aiReviewCode(code, language, filePath);
      if (result.success && result.data) {
        setReviewResults(result.data);
      } else {
        setError(result.error || 'Failed to review code');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!hasCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.electronAPI.aiGenerateTests(code, language, filePath);
      if (result.success && result.data) {
        setTestResult(result.data);
      } else {
        setError(result.error || 'Failed to generate tests');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocs = async () => {
    if (!hasCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.electronAPI.aiGenerateDocs(code, language);
      if (result.success && result.data) {
        setDocsResult(result.data);
      } else {
        setError(result.error || 'Failed to generate documentation');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainCode = async () => {
    if (!hasCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.electronAPI.aiExplainCode(code, language);
      if (result.success && result.data) {
        setExplanationResult(result.data);
      } else {
        setError(result.error || 'Failed to explain code');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestRefactoring = async () => {
    if (!hasCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.electronAPI.aiSuggestRefactoring(code, language);
      if (result.success && result.data) {
        setRefactoringSuggestions(result.data);
      } else {
        setError(result.error || 'Failed to suggest refactoring');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderCodeReview = () => (
    <div className="ai-assistant-action-section">
      <h4>Code Review</h4>
      <p>AI will analyze your code for bugs, quality issues, performance problems, and best practices.</p>
      <button 
        className="ai-assistant-action-btn" 
        onClick={handleReviewCode}
        disabled={loading || !hasCode}
      >
        {loading && activeTab === 'review' ? 'Analyzing...' : 'Review Code'}
      </button>
      
      {reviewResults && (
        <div className="ai-assistant-result">
          {reviewResults.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No issues found! Your code looks good.</p>
          ) : (
            <div className="code-review-issues">
              {reviewResults.map((issue, index) => (
                <div key={index} className={`code-review-issue ${issue.severity}`}>
                  <div className="code-review-issue-header">
                    <span className="code-review-issue-severity">{issue.severity}</span>
                    {issue.line && <span className="code-review-issue-line">Line {issue.line}</span>}
                  </div>
                  <p className="code-review-issue-message">{issue.message}</p>
                  {issue.suggestion && (
                    <p className="code-review-issue-suggestion">
                      <strong>Suggestion:</strong> {issue.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTestGeneration = () => (
    <div className="ai-assistant-action-section">
      <h4>Generate Tests</h4>
      <p>AI will create comprehensive unit tests for your code using the appropriate testing framework.</p>
      <button 
        className="ai-assistant-action-btn" 
        onClick={handleGenerateTests}
        disabled={loading || !hasCode}
      >
        {loading && activeTab === 'test' ? 'Generating...' : 'Generate Tests'}
      </button>
      
      {testResult && (
        <div className="ai-assistant-result test-generation-result">
          <div className="test-generation-info">
            <div className="test-generation-info-item">
              <span className="test-generation-info-label">Framework:</span>
              <span className="test-generation-info-value">{testResult.framework}</span>
            </div>
            {testResult.coverage.length > 0 && (
              <div className="test-generation-info-item">
                <span className="test-generation-info-label">Coverage:</span>
                <span className="test-generation-info-value">{testResult.coverage.join(', ')}</span>
              </div>
            )}
          </div>
          <pre className="test-code-block">{testResult.testCode}</pre>
        </div>
      )}
    </div>
  );

  const renderDocGeneration = () => (
    <div className="ai-assistant-action-section">
      <h4>Generate Documentation</h4>
      <p>AI will create comprehensive documentation for your code in the appropriate format.</p>
      <button 
        className="ai-assistant-action-btn" 
        onClick={handleGenerateDocs}
        disabled={loading || !hasCode}
      >
        {loading && activeTab === 'docs' ? 'Generating...' : 'Generate Docs'}
      </button>
      
      {docsResult && (
        <div className="ai-assistant-result documentation-result">
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Format: {docsResult.format}
          </p>
          <pre className="documentation-block">{docsResult.documentation}</pre>
        </div>
      )}
    </div>
  );

  const renderCodeExplanation = () => (
    <div className="ai-assistant-action-section">
      <h4>Explain Code</h4>
      <p>AI will provide a detailed explanation of what your code does and how it works.</p>
      <button 
        className="ai-assistant-action-btn" 
        onClick={handleExplainCode}
        disabled={loading || !hasCode}
      >
        {loading && activeTab === 'explain' ? 'Analyzing...' : 'Explain Code'}
      </button>
      
      {explanationResult && (
        <div className="ai-assistant-result code-explanation">
          <div className={`code-explanation-complexity ${explanationResult.complexity}`}>
            Complexity: {explanationResult.complexity.toUpperCase()}
          </div>
          <p className="code-explanation-text">{explanationResult.explanation}</p>
          {explanationResult.keyPoints.length > 0 && (
            <>
              <strong style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>Key Points:</strong>
              <ul className="code-explanation-keypoints">
                {explanationResult.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderRefactoringSuggestions = () => (
    <div className="ai-assistant-action-section">
      <h4>Refactoring Suggestions</h4>
      <p>AI will analyze your code and suggest improvements for better maintainability and performance.</p>
      <button 
        className="ai-assistant-action-btn" 
        onClick={handleSuggestRefactoring}
        disabled={loading || !hasCode}
      >
        {loading && activeTab === 'refactor' ? 'Analyzing...' : 'Get Suggestions'}
      </button>
      
      {refactoringSuggestions && (
        <div className="ai-assistant-result">
          {refactoringSuggestions.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No refactoring suggestions. Your code is already well-structured!</p>
          ) : (
            <div className="refactoring-suggestions">
              {refactoringSuggestions.map((suggestion, index) => (
                <div key={index} className="refactoring-suggestion">
                  <div className="refactoring-suggestion-header">
                    <span className="refactoring-suggestion-title">{suggestion.title}</span>
                    <span className={`refactoring-suggestion-impact ${suggestion.impact}`}>
                      {suggestion.impact.toUpperCase()}
                    </span>
                  </div>
                  <p className="refactoring-suggestion-description">{suggestion.description}</p>
                  <div className="refactoring-suggestion-code">
                    <div>
                      <div className="refactoring-suggestion-code-label">Before:</div>
                      <pre className="refactoring-suggestion-code-block">{suggestion.before}</pre>
                    </div>
                    <div>
                      <div className="refactoring-suggestion-code-label">After:</div>
                      <pre className="refactoring-suggestion-code-block">{suggestion.after}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (!hasCode) {
      return (
        <div className="ai-assistant-no-code">
          <p>No code to analyze. Please open a file or write some code first.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'review':
        return renderCodeReview();
      case 'test':
        return renderTestGeneration();
      case 'docs':
        return renderDocGeneration();
      case 'explain':
        return renderCodeExplanation();
      case 'refactor':
        return renderRefactoringSuggestions();
      default:
        return null;
    }
  };

  return (
    <div className="ai-assistant-panel">
      <div className="ai-assistant-header">
        <h3>AI Assistant</h3>
        <button className="ai-assistant-close" onClick={onClose}>×</button>
      </div>
      
      <div className="ai-assistant-tabs">
        <button 
          className={`ai-assistant-tab ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          Review
        </button>
        <button 
          className={`ai-assistant-tab ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          Tests
        </button>
        <button 
          className={`ai-assistant-tab ${activeTab === 'docs' ? 'active' : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          Docs
        </button>
        <button 
          className={`ai-assistant-tab ${activeTab === 'explain' ? 'active' : ''}`}
          onClick={() => setActiveTab('explain')}
        >
          Explain
        </button>
        <button 
          className={`ai-assistant-tab ${activeTab === 'refactor' ? 'active' : ''}`}
          onClick={() => setActiveTab('refactor')}
        >
          Refactor
        </button>
      </div>
      
      <div className="ai-assistant-content">
        {loading && (
          <div className="ai-assistant-loading">
            <div className="ai-assistant-loading-spinner"></div>
            <p style={{ marginTop: 16 }}>Processing...</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="ai-assistant-error">
            {error}
          </div>
        )}
        
        {!loading && !error && renderContent()}
      </div>
    </div>
  );
};

export default AIAssistantPanel;

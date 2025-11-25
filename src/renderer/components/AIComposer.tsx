import React, { useState } from 'react';
import { t } from '../i18n';
import './AIComposer.css';

interface FileEdit {
  filePath: string;
  originalContent: string;
  newContent: string;
  description: string;
}

interface AIComposerProps {
  isOpen: boolean;
  onClose: () => void;
  rootPath: string;
  openTabs: Array<{ filePath: string; content: string }>;
  onApplyEdits: (edits: FileEdit[]) => void;
}

const AIComposer: React.FC<AIComposerProps> = ({ 
  isOpen, 
  onClose, 
  rootPath,
  openTabs,
  onApplyEdits 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposedEdits, setProposedEdits] = useState<FileEdit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入请求内容');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProposedEdits([]);

    try {
      // 构建上下文
      const contextFiles = openTabs.map(tab => ({
        path: tab.filePath,
        content: tab.content
      }));

      const systemPrompt = `You are an expert code editor AI. Analyze the user's request and propose specific file edits.
      
Current workspace: ${rootPath}
Open files: ${contextFiles.map(c => c.path).join(', ')}

For each file that needs changes, respond in this exact JSON format:
{
  "edits": [
    {
      "filePath": "relative/path/to/file",
      "description": "Brief description of changes",
      "newContent": "Complete new file content"
    }
  ]
}

Make sure your response is valid JSON and includes complete file contents, not just diffs.`;

      const userPrompt = `${prompt}

Context - Current files content:
${contextFiles.map(c => `\n=== ${c.path} ===\n${c.content}`).join('\n')}`;

      // 调用 AI
      const result = await window.electronAPI.aiChat(userPrompt, { 
        systemPrompt,
        files: contextFiles 
      });
      
      if (result.success && result.data) {
        try {
          // 尝试解析 JSON 响应
          const jsonMatch = result.data.match(/\{[\s\S]*"edits"[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const edits: FileEdit[] = parsed.edits.map((edit: any) => ({
              filePath: edit.filePath,
              originalContent: contextFiles.find(c => c.path.endsWith(edit.filePath))?.content || '',
              newContent: edit.newContent,
              description: edit.description
            }));
            setProposedEdits(edits);
          } else {
            setError('AI response format error. Please try again.');
          }
        } catch (e) {
          setError('Failed to parse AI response. The AI may not have followed the format.');
        }
      } else {
        setError(result.error || 'Failed to generate edits');
      }
    } catch (err: any) {
      setError(err.message || t('composer.error').replace('{0}', '发生错误'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (proposedEdits.length === 0) return;
    
    const confirmed = window.confirm(
      t('composer.confirmApply').replace('{0}', proposedEdits.length.toString())
    );
    
    if (confirmed) {
      onApplyEdits(proposedEdits);
      setProposedEdits([]);
      setPrompt('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="composer-overlay" onClick={onClose}>
      <div className="composer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="composer-header">
          <h3>🎨 {t('composer.title')}</h3>
          <button className="composer-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="composer-body">
          <div className="composer-context">
            <p className="composer-hint">
              🔍 {t('composer.context').replace('{0}', openTabs.length.toString())}
            </p>
            <div className="composer-files">
              {openTabs.map((tab, index) => (
                <span key={index} className="composer-file-tag">
                  📄 {tab.filePath.split(/[/\\]/).pop()}
                </span>
              ))}
            </div>
          </div>

          <textarea
            className="composer-prompt"
            placeholder={t('composer.promptPlaceholder')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />

          <button 
            className="composer-generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? '⏳ ' + t('composer.generating') : '✨ ' + t('composer.generate')}
          </button>

          {error && (
            <div className="composer-error">
              ❌ {error}
            </div>
          )}

          {proposedEdits.length > 0 && (
            <div className="composer-edits">
              <div className="composer-edits-header">
                <h4>📝 {t('composer.proposedChanges').replace('{0}', proposedEdits.length.toString())}</h4>
                <button className="composer-apply-btn" onClick={handleApply}>
                  ✅ {t('composer.applyAll')}
                </button>
              </div>

              {proposedEdits.map((edit, index) => (
                <div key={index} className="composer-edit-item">
                  <div className="composer-edit-header">
                    <span className="composer-edit-file">📄 {edit.filePath}</span>
                    <span className="composer-edit-desc">{edit.description}</span>
                  </div>
                  <div className="composer-edit-preview">
                    <pre>{edit.newContent.substring(0, 200)}...</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIComposer;

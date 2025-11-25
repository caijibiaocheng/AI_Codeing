import React, { useState, useEffect } from 'react';
import './GitPanel.css';

interface GitPanelProps {
  rootPath: string;
  onFileSelect?: (filePath: string) => void;
  onViewDiff?: (filePath: string) => void;
}

const GitPanel: React.FC<GitPanelProps> = ({ rootPath, onFileSelect, onViewDiff }) => {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [activeTab, setActiveTab] = useState<'changes' | 'commits' | 'branches'>('changes');

  useEffect(() => {
    if (rootPath) {
      loadAll();
    }
  }, [rootPath]);

  const loadAll = async () => {
    await Promise.all([
      loadGitStatus(),
      loadBranches(),
      loadCommits()
    ]);
  };

  const loadGitStatus = async () => {
    if (!window.electronAPI) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await window.electronAPI.gitStatus(rootPath);
      if (result.success && result.data) {
        setGitStatus(result.data);
      } else {
        setError(result.error || 'Failed to get git status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get git status');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranches = async () => {
    if (!window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.gitBranches(rootPath);
      if (result.success && result.data) {
        setBranches(result.data.filter(b => !b.remote));
      }
    } catch (err: any) {
      console.error('Failed to load branches:', err);
    }
  };

  const loadCommits = async () => {
    if (!window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.gitLog(rootPath, 20);
      if (result.success && result.data) {
        setCommits(result.data);
      }
    } catch (err: any) {
      console.error('Failed to load commits:', err);
    }
  };

  const handleStageFile = async (filePath: string) => {
    if (!window.electronAPI) return;
    
    const result = await window.electronAPI.gitStageFile(rootPath, filePath);
    if (result.success) {
      await loadGitStatus();
    } else {
      alert(`Failed to stage file: ${result.error}`);
    }
  };

  const handleUnstageFile = async (filePath: string) => {
    if (!window.electronAPI) return;
    
    const result = await window.electronAPI.gitUnstageFile(rootPath, filePath);
    if (result.success) {
      await loadGitStatus();
    } else {
      alert(`Failed to unstage file: ${result.error}`);
    }
  };

  const handleStageAll = async () => {
    if (!window.electronAPI) return;
    
    const result = await window.electronAPI.gitStageAll(rootPath);
    if (result.success) {
      await loadGitStatus();
    } else {
      alert(`Failed to stage all: ${result.error}`);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      alert('Please enter a commit message');
      return;
    }

    if (!window.electronAPI) return;

    const result = await window.electronAPI.gitCommit(rootPath, commitMessage);
    if (result.success) {
      alert('Committed successfully!');
      setCommitMessage('');
      await loadAll();
    } else {
      alert(`Commit failed: ${result.error}`);
    }
  };

  const handlePush = async () => {
    if (!window.electronAPI) return;
    
    if (!confirm('Push to remote?')) return;
    
    const result = await window.electronAPI.gitPush(rootPath);
    if (result.success) {
      alert('Pushed successfully!');
      await loadGitStatus();
    } else {
      alert(`Push failed: ${result.error}`);
    }
  };

  const handlePull = async () => {
    if (!window.electronAPI) return;
    
    if (!confirm('Pull from remote?')) return;
    
    const result = await window.electronAPI.gitPull(rootPath);
    if (result.success) {
      alert('Pulled successfully!');
      await loadAll();
    } else {
      alert(`Pull failed: ${result.error}`);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      alert('Please enter a branch name');
      return;
    }

    if (!window.electronAPI) return;

    const result = await window.electronAPI.gitCreateBranch(rootPath, newBranchName);
    if (result.success) {
      alert(`Branch '${newBranchName}' created!`);
      setNewBranchName('');
      await loadBranches();
    } else {
      alert(`Failed to create branch: ${result.error}`);
    }
  };

  const handleCheckoutBranch = async (branchName: string) => {
    if (!window.electronAPI) return;
    
    const result = await window.electronAPI.gitCheckoutBranch(rootPath, branchName);
    if (result.success) {
      alert(`Switched to branch '${branchName}'`);
      await loadAll();
    } else {
      alert(`Failed to checkout branch: ${result.error}`);
    }
  };

  const handleDeleteBranch = async (branchName: string) => {
    if (!window.electronAPI) return;
    
    if (!confirm(`Delete branch '${branchName}'?`)) return;
    
    const result = await window.electronAPI.gitDeleteBranch(rootPath, branchName, false);
    if (result.success) {
      alert(`Branch '${branchName}' deleted!`);
      await loadBranches();
    } else {
      alert(`Failed to delete branch: ${result.error}`);
    }
  };

  if (!rootPath) {
    return (
      <div className="git-panel">
        <div className="git-panel-header">
          <h3>Git</h3>
        </div>
        <div className="git-panel-body">
          <p className="git-no-folder">No folder opened</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="git-panel">
        <div className="git-panel-header">
          <h3>Git</h3>
        </div>
        <div className="git-panel-body">
          <p className="git-error">{error}</p>
          <button onClick={loadAll} className="btn-refresh">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="git-panel">
      <div className="git-panel-header">
        <h3>Git</h3>
        {gitStatus && (
          <div className="git-branch-info">
            <span className="git-branch-icon">⎇</span>
            <span className="git-branch-name">{gitStatus.branch}</span>
            {gitStatus.ahead > 0 && <span className="git-ahead">↑{gitStatus.ahead}</span>}
            {gitStatus.behind > 0 && <span className="git-behind">↓{gitStatus.behind}</span>}
          </div>
        )}
      </div>

      <div className="git-tabs">
        <button 
          className={`git-tab ${activeTab === 'changes' ? 'active' : ''}`}
          onClick={() => setActiveTab('changes')}
        >
          Changes
        </button>
        <button 
          className={`git-tab ${activeTab === 'commits' ? 'active' : ''}`}
          onClick={() => setActiveTab('commits')}
        >
          Commits
        </button>
        <button 
          className={`git-tab ${activeTab === 'branches' ? 'active' : ''}`}
          onClick={() => setActiveTab('branches')}
        >
          Branches
        </button>
      </div>

      <div className="git-panel-body">
        {isLoading ? (
          <div className="git-loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'changes' && gitStatus && (
              <div className="git-changes">
                <div className="git-actions">
                  <button onClick={handlePull} className="git-btn git-btn-pull">↓ Pull</button>
                  <button onClick={handlePush} className="git-btn git-btn-push">↑ Push</button>
                  <button onClick={handleStageAll} className="git-btn git-btn-stage">+ Stage All</button>
                </div>

                {gitStatus.staged.length > 0 && (
                  <div className="git-section">
                    <h4>Staged Changes ({gitStatus.staged.length})</h4>
                    {gitStatus.staged.map((file) => (
                      <div key={file.path} className="git-file">
                        <span className={`git-status git-status-${file.status}`}>
                          {file.status[0].toUpperCase()}
                        </span>
                        <span className="git-filename" onClick={() => onFileSelect?.(file.path)}>
                          {file.path}
                        </span>
                        <button 
                          onClick={() => handleUnstageFile(file.path)}
                          className="git-file-action"
                          title="Unstage"
                        >
                          −
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {gitStatus.unstaged.length > 0 && (
                  <div className="git-section">
                    <h4>Unstaged Changes ({gitStatus.unstaged.length})</h4>
                    {gitStatus.unstaged.map((file) => (
                      <div key={file.path} className="git-file">
                        <span className={`git-status git-status-${file.status}`}>
                          {file.status[0].toUpperCase()}
                        </span>
                        <span className="git-filename" onClick={() => onFileSelect?.(file.path)}>
                          {file.path}
                        </span>
                        <button 
                          onClick={() => handleStageFile(file.path)}
                          className="git-file-action"
                          title="Stage"
                        >
                          +
                        </button>
                        {onViewDiff && (
                          <button 
                            onClick={() => onViewDiff(file.path)}
                            className="git-file-action"
                            title="View Diff"
                          >
                            ≠
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {gitStatus.untracked.length > 0 && (
                  <div className="git-section">
                    <h4>Untracked Files ({gitStatus.untracked.length})</h4>
                    {gitStatus.untracked.map((file) => (
                      <div key={file} className="git-file">
                        <span className="git-status git-status-untracked">U</span>
                        <span className="git-filename" onClick={() => onFileSelect?.(file)}>
                          {file}
                        </span>
                        <button 
                          onClick={() => handleStageFile(file)}
                          className="git-file-action"
                          title="Stage"
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {gitStatus.staged.length === 0 && 
                 gitStatus.unstaged.length === 0 && 
                 gitStatus.untracked.length === 0 && (
                  <p className="git-clean">No changes</p>
                )}

                <div className="git-commit-box">
                  <textarea
                    className="git-commit-message"
                    placeholder="Commit message..."
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    rows={3}
                  />
                  <button 
                    onClick={handleCommit}
                    disabled={gitStatus.staged.length === 0 || !commitMessage.trim()}
                    className="git-btn git-btn-commit"
                  >
                    Commit
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'commits' && (
              <div className="git-commits">
                {commits.map((commit) => (
                  <div key={commit.hash} className="git-commit">
                    <div className="git-commit-hash">{commit.hash}</div>
                    <div className="git-commit-message">{commit.message}</div>
                    <div className="git-commit-author">{commit.author}</div>
                    <div className="git-commit-date">{new Date(commit.date).toLocaleString()}</div>
                  </div>
                ))}
                {commits.length === 0 && <p>No commits</p>}
              </div>
            )}

            {activeTab === 'branches' && (
              <div className="git-branches">
                <div className="git-branch-create">
                  <input
                    type="text"
                    placeholder="New branch name..."
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="git-branch-input"
                  />
                  <button onClick={handleCreateBranch} className="git-btn git-btn-create">
                    Create
                  </button>
                </div>

                <div className="git-branch-list">
                  {branches.map((branch) => (
                    <div key={branch.name} className={`git-branch ${branch.current ? 'current' : ''}`}>
                      <span className="git-branch-name">{branch.name}</span>
                      {branch.current && <span className="git-current-badge">Current</span>}
                      {!branch.current && (
                        <div className="git-branch-actions">
                          <button 
                            onClick={() => handleCheckoutBranch(branch.name)}
                            className="git-branch-action"
                            title="Checkout"
                          >
                            ⎇
                          </button>
                          <button 
                            onClick={() => handleDeleteBranch(branch.name)}
                            className="git-branch-action git-branch-delete"
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {branches.length === 0 && <p>No branches</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GitPanel;

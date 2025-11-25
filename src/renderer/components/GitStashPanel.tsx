import React, { useEffect, useState } from 'react';
import { t } from '../i18n';
import './GitStashPanel.css';

interface GitStash {
  index: number;
  name: string;
  branch: string;
  message: string;
}

interface GitStashPanelProps {
  rootPath: string | null;
  onClose: () => void;
}

const GitStashPanel: React.FC<GitStashPanelProps> = ({ rootPath, onClose }) => {
  const [stashes, setStashes] = useState<GitStash[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [stashMessage, setStashMessage] = useState('');

  useEffect(() => {
    if (rootPath) {
      loadStashes();
    }
  }, [rootPath]);

  const loadStashes = async () => {
    if (!rootPath) return;

    try {
      const result = await window.electronAPI.gitStashList(rootPath);
      if (result.success && result.data) {
        setStashes(result.data);
      }
    } catch (error) {
      console.error('Failed to load stashes:', error);
    }
  };

  const handleSaveStash = async () => {
    if (!rootPath) return;

    setLoading(true);
    try {
      const result = await window.electronAPI.gitStashSave(
        rootPath,
        stashMessage || undefined
      );
      if (result.success) {
        setShowSaveModal(false);
        setStashMessage('');
        await loadStashes();
      } else {
        alert(`Failed to save stash: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (index: number) => {
    if (!rootPath) return;

    setLoading(true);
    try {
      const result = await window.electronAPI.gitStashApply(rootPath, index);
      if (result.success) {
        alert('Stash applied successfully');
      } else {
        alert(`Failed to apply stash: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePop = async (index: number) => {
    if (!rootPath) return;

    setLoading(true);
    try {
      const result = await window.electronAPI.gitStashPop(rootPath, index);
      if (result.success) {
        await loadStashes();
      } else {
        alert(`Failed to pop stash: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (index: number) => {
    if (!rootPath) return;
    if (!confirm(t('gitStash.confirmDrop'))) return;

    setLoading(true);
    try {
      const result = await window.electronAPI.gitStashDrop(rootPath, index);
      if (result.success) {
        await loadStashes();
        if (selectedIndex === index) {
          setSelectedIndex(null);
        }
      } else {
        alert(`Failed to drop stash: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!rootPath) return;
    if (!confirm(t('gitStash.confirmClear'))) return;

    setLoading(true);
    try {
      const result = await window.electronAPI.gitStashClear(rootPath);
      if (result.success) {
        setStashes([]);
        setSelectedIndex(null);
      } else {
        alert(`Failed to clear stashes: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!rootPath) {
    return (
      <div className="git-stash-panel">
        <div className="git-stash-header">
          <h3>{t('gitStash.title')}</h3>
          <button className="git-stash-btn" onClick={onClose}>{t('common.close')}</button>
        </div>
        <div className="git-stash-empty">
          {t('gitStash.noWorkspaceFolder')}
        </div>
      </div>
    );
  }

  return (
    <div className="git-stash-panel">
      <div className="git-stash-header">
        <h3>{t('gitStash.title')}</h3>
        <div className="git-stash-actions">
          <button
            className="git-stash-btn"
            onClick={() => setShowSaveModal(true)}
            disabled={loading}
          >
            {t('gitStash.saveStash')}
          </button>
          {stashes.length > 0 && (
            <button
              className="git-stash-btn git-stash-btn-danger"
              onClick={handleClearAll}
              disabled={loading}
            >
              {t('gitStash.clear')}
            </button>
          )}
        </div>
      </div>

      <div className="git-stash-list">
        {stashes.length === 0 ? (
          <div className="git-stash-empty">
            {t('gitStash.noStashes')}
          </div>
        ) : (
          stashes.map((stash) => (
            <div
              key={stash.index}
              className={`git-stash-item ${selectedIndex === stash.index ? 'selected' : ''}`}
              onClick={() => setSelectedIndex(stash.index)}
            >
              <div className="git-stash-item-header">
                <span className="git-stash-item-name">{stash.name}</span>
                <div className="git-stash-item-actions">
                  <button
                    className="git-stash-item-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(stash.index);
                    }}
                    disabled={loading}
                  >
                    {t('gitStash.apply')}
                  </button>
                  <button
                    className="git-stash-item-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePop(stash.index);
                    }}
                    disabled={loading}
                  >
                    {t('gitStash.pop')}
                  </button>
                  <button
                    className="git-stash-item-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrop(stash.index);
                    }}
                    disabled={loading}
                  >
                    {t('gitStash.drop')}
                  </button>
                </div>
              </div>
              <div className="git-stash-item-info">
                {t('gitStash.branch')}: {stash.branch}
              </div>
              <div className="git-stash-item-message">
                {stash.message}
              </div>
            </div>
          ))
        )}
      </div>

      {showSaveModal && (
        <div className="git-stash-input-modal" onClick={() => setShowSaveModal(false)}>
          <div className="git-stash-input-content" onClick={(e) => e.stopPropagation()}>
            <h4>{t('gitStash.saveStash')}</h4>
            <input
              type="text"
              className="git-stash-input"
              placeholder={t('gitStash.message')}
              value={stashMessage}
              onChange={(e) => setStashMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveStash();
                }
              }}
              autoFocus
            />
            <div className="git-stash-input-actions">
              <button
                className="git-stash-btn"
                onClick={() => setShowSaveModal(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="git-stash-btn"
                onClick={handleSaveStash}
                disabled={loading}
              >
                {t('gitStash.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitStashPanel;

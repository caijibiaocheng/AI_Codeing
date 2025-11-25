import React, { useState, useEffect } from 'react';
import './ExtensionPanel.css';

interface Extension {
  id: string;
  manifest: {
    name: string;
    displayName?: string;
    version: string;
    publisher: string;
    description?: string;
    icon?: string;
    categories?: string[];
  };
  enabled: boolean;
  installedAt: number;
}

interface ExtensionPanelProps {
  onClose: () => void;
}

const ExtensionPanel: React.FC<ExtensionPanelProps> = ({ onClose }) => {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);

  useEffect(() => {
    loadExtensions();
    
    // 监听扩展通知
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onExtensionNotification((data: any) => {
        const { type, message } = data;
        const notificationClass = type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info';
        showNotification(message, notificationClass);
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, []);

  const loadExtensions = async () => {
    if (!window.electronAPI) return;
    
    setLoading(true);
    try {
      const result = await window.electronAPI.extensionList();
      if (result.success && result.data) {
        setExtensions(result.data);
      }
    } catch (error: any) {
      console.error('Failed to load extensions:', error);
      showNotification('Failed to load extensions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallVSIX = async () => {
    if (!window.electronAPI) return;
    
    try {
      const selectResult = await window.electronAPI.extensionSelectVSIX();
      if (selectResult.success && selectResult.filePath) {
        setLoading(true);
        const installResult = await window.electronAPI.extensionInstall(selectResult.filePath);
        
        if (installResult.success) {
          showNotification('Extension installed successfully!', 'success');
          loadExtensions();
        } else {
          showNotification(`Installation failed: ${installResult.error}`, 'error');
        }
      }
    } catch (error: any) {
      console.error('Failed to install extension:', error);
      showNotification('Failed to install extension', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async (extensionId: string) => {
    if (!window.electronAPI) return;
    
    const confirmed = confirm('Are you sure you want to uninstall this extension?');
    if (!confirmed) return;
    
    try {
      const result = await window.electronAPI.extensionUninstall(extensionId);
      if (result.success) {
        showNotification('Extension uninstalled successfully!', 'success');
        loadExtensions();
        if (selectedExtension?.id === extensionId) {
          setSelectedExtension(null);
        }
      } else {
        showNotification(`Uninstall failed: ${result.error}`, 'error');
      }
    } catch (error: any) {
      console.error('Failed to uninstall extension:', error);
      showNotification('Failed to uninstall extension', 'error');
    }
  };

  const handleToggleEnabled = async (extension: Extension) => {
    if (!window.electronAPI) return;
    
    try {
      const result = extension.enabled
        ? await window.electronAPI.extensionDisable(extension.id)
        : await window.electronAPI.extensionEnable(extension.id);
      
      if (result.success) {
        showNotification(
          `Extension ${extension.enabled ? 'disabled' : 'enabled'} successfully!`,
          'success'
        );
        loadExtensions();
      } else {
        showNotification(`Failed to toggle extension: ${result.error}`, 'error');
      }
    } catch (error: any) {
      console.error('Failed to toggle extension:', error);
      showNotification('Failed to toggle extension', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    // 简单的通知实现（后续可以使用专门的通知组件）
    const notification = document.createElement('div');
    notification.className = `extension-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="extension-panel-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="extension-panel">
        <div className="extension-panel-header">
          <h2>📦 Extensions</h2>
          <div className="extension-panel-actions">
            <button 
              className="btn-install-vsix" 
              onClick={handleInstallVSIX}
              disabled={loading}
            >
              📥 Install from VSIX
            </button>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="extension-panel-body">
          {loading && <div className="loading">Loading extensions...</div>}
          
          {!loading && extensions.length === 0 && (
            <div className="no-extensions">
              <p>No extensions installed yet.</p>
              <p>Click "Install from VSIX" to add extensions.</p>
            </div>
          )}

          {!loading && extensions.length > 0 && (
            <div className="extensions-list">
              {extensions.map((ext) => (
                <div 
                  key={ext.id} 
                  className={`extension-item ${selectedExtension?.id === ext.id ? 'selected' : ''} ${!ext.enabled ? 'disabled' : ''}`}
                  onClick={() => setSelectedExtension(ext)}
                >
                  <div className="extension-item-header">
                    <div className="extension-icon">
                      {ext.manifest.icon ? '🎨' : '📦'}
                    </div>
                    <div className="extension-info">
                      <div className="extension-name">
                        {ext.manifest.displayName || ext.manifest.name}
                      </div>
                      <div className="extension-meta">
                        <span className="extension-publisher">{ext.manifest.publisher}</span>
                        <span className="extension-version">v{ext.manifest.version}</span>
                      </div>
                    </div>
                    <div className="extension-actions">
                      <button
                        className={`btn-toggle ${ext.enabled ? 'enabled' : 'disabled'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleEnabled(ext);
                        }}
                        title={ext.enabled ? 'Disable' : 'Enable'}
                      >
                        {ext.enabled ? '✓' : '○'}
                      </button>
                      <button
                        className="btn-uninstall"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUninstall(ext.id);
                        }}
                        title="Uninstall"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {ext.manifest.description && (
                    <div className="extension-description">
                      {ext.manifest.description}
                    </div>
                  )}
                  
                  <div className="extension-footer">
                    {ext.manifest.categories && ext.manifest.categories.length > 0 && (
                      <div className="extension-categories">
                        {ext.manifest.categories.map((cat, idx) => (
                          <span key={idx} className="extension-category">{cat}</span>
                        ))}
                      </div>
                    )}
                    <span className="extension-installed-date">
                      Installed: {formatDate(ext.installedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedExtension && (
          <div className="extension-details">
            <h3>Extension Details</h3>
            <div className="details-content">
              <p><strong>ID:</strong> {selectedExtension.id}</p>
              <p><strong>Name:</strong> {selectedExtension.manifest.displayName || selectedExtension.manifest.name}</p>
              <p><strong>Version:</strong> {selectedExtension.manifest.version}</p>
              <p><strong>Publisher:</strong> {selectedExtension.manifest.publisher}</p>
              <p><strong>Status:</strong> {selectedExtension.enabled ? '✅ Enabled' : '❌ Disabled'}</p>
              {selectedExtension.manifest.description && (
                <p><strong>Description:</strong> {selectedExtension.manifest.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtensionPanel;

import React, { useState, useEffect } from 'react';
import { t } from '../i18n';

interface SettingsModalProps {
  onClose: () => void;
  onSettingsSaved?: (options: { 
    theme: 'light' | 'dark'; 
    editorTheme: string;
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
  }) => void;
  currentTheme: 'light' | 'dark';
  currentEditorTheme: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSettingsSaved, currentTheme, currentEditorTheme }) => {
  const [activeTab, setActiveTab] = useState<'api' | 'mcp' | 'appearance'>('api');
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [azureEndpoint, setAzureEndpoint] = useState('');
  const [azureApiVersion, setAzureApiVersion] = useState('2024-02-15-preview');
  const [theme, setTheme] = useState<'light' | 'dark'>(currentTheme);
  const [editorTheme, setEditorTheme] = useState(currentEditorTheme || 'vs-dark');
  const [fontSize, setFontSize] = useState<number>(14);
  const [fontFamily, setFontFamily] = useState<string>("'Consolas', 'Monaco', 'Courier New', monospace");
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [locale, setLocale] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(2048);
  const [mcpServers, setMcpServers] = useState<any[]>([]);
  const [newServerName, setNewServerName] = useState('');
  const [newServerCommand, setNewServerCommand] = useState('');
  const [newServerArgs, setNewServerArgs] = useState('');
  const modelPresets = {
    openai: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo'
    ],
    anthropic: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-instant-1.2'
    ],
    azure: []
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const [savedProvider, savedApiKey, savedModel, savedAzureEndpoint, savedAzureApiVersion, savedTheme, savedEditorTheme, savedFontSize, savedFontFamily, savedLineHeight, savedLocale, savedTemp, savedMaxTokens, servers] =
      await Promise.all([
        window.electronAPI.getConfig('ai.provider'),
        window.electronAPI.getConfig('ai.apiKey'),
        window.electronAPI.getConfig('ai.model'),
        window.electronAPI.getConfig('ai.azureEndpoint'),
        window.electronAPI.getConfig('ai.azureApiVersion'),
        window.electronAPI.getConfig('ui.theme'),
        window.electronAPI.getConfig('editor.theme'),
        window.electronAPI.getConfig('editor.fontSize'),
        window.electronAPI.getConfig('editor.fontFamily'),
        window.electronAPI.getConfig('editor.lineHeight'),
        window.electronAPI.getConfig('app.locale'),
        window.electronAPI.getConfig('ai.temperature'),
        window.electronAPI.getConfig('ai.maxTokens'),
        window.electronAPI.mcpListServers()
      ]);

    if (typeof savedProvider === 'string') setProvider(savedProvider);
    if (typeof savedApiKey === 'string') setApiKey(savedApiKey);
    if (typeof savedModel === 'string') setModel(savedModel);
    if (typeof savedAzureEndpoint === 'string') setAzureEndpoint(savedAzureEndpoint);
    if (typeof savedAzureApiVersion === 'string') setAzureApiVersion(savedAzureApiVersion);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    if (typeof savedEditorTheme === 'string') setEditorTheme(savedEditorTheme);
    if (typeof savedFontSize === 'number') setFontSize(savedFontSize);
    if (typeof savedFontFamily === 'string') setFontFamily(savedFontFamily);
    if (typeof savedLineHeight === 'number') setLineHeight(savedLineHeight);
    if (savedLocale === 'zh-CN' || savedLocale === 'en-US') setLocale(savedLocale);
    if (typeof savedTemp === 'number') setTemperature(savedTemp);
    if (typeof savedMaxTokens === 'number') setMaxTokens(savedMaxTokens);
    setMcpServers(servers || []);
  };

  const handleSaveAPI = async () => {
    if (provider === 'azure' && (!azureEndpoint || !apiKey || !model)) {
      alert(t('settings.fillAzureRequired'));
      return;
    }

    if (!apiKey || !model) {
      alert(t('settings.fillRequired'));
      return;
    }

    await window.electronAPI.setConfig('ai.provider', provider);
    await window.electronAPI.setConfig('ai.apiKey', apiKey);
    await window.electronAPI.setConfig('ai.model', model);
    await window.electronAPI.setConfig('ai.azureEndpoint', azureEndpoint);
    await window.electronAPI.setConfig('ai.azureApiVersion', azureApiVersion);
    await window.electronAPI.setConfig('ai.temperature', temperature);
    await window.electronAPI.setConfig('ai.maxTokens', maxTokens);
    alert(t('settings.apiSettingsSaved'));
  };

  const handleSaveAppearance = async () => {
    await window.electronAPI.setConfig('ui.theme', theme);
    await window.electronAPI.setConfig('editor.theme', editorTheme);
    await window.electronAPI.setConfig('editor.fontSize', fontSize);
    await window.electronAPI.setConfig('editor.fontFamily', fontFamily);
    await window.electronAPI.setConfig('editor.lineHeight', lineHeight);
    await window.electronAPI.setConfig('app.locale', locale);
    
    // 立即更新主进程的窗口标题和菜单语言
    window.electronAPI.updateAppLanguage(locale);
    
    onSettingsSaved?.({ theme, editorTheme, fontSize, fontFamily, lineHeight });
    
    // 自动询问是否重新加载应用
    const shouldReload = window.confirm(
      locale === 'zh-CN' 
        ? t('settings.appearanceSaved') 
        : t('settings.appearanceSaved')
    );
    
    if (shouldReload) {
      window.location.reload();
    }
  };

  const handleAddMCPServer = async () => {
    if (!newServerName || !newServerCommand) {
      alert('Please fill in server name and command');
      return;
    }

    const args = newServerArgs.split(' ').filter(arg => arg.trim());
    await window.electronAPI.mcpAddServer({
      name: newServerName,
      command: newServerCommand,
      args,
      enabled: true
    });

    setNewServerName('');
    setNewServerCommand('');
    setNewServerArgs('');
    loadSettings();
  };

  const handleRemoveMCPServer = async (serverId: string) => {
    await window.electronAPI.mcpRemoveServer(serverId);
    loadSettings();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('settings.title')}</h2>
          <button className="chat-close" onClick={onClose}>×</button>
        </div>

        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            🤖 {t('settings.apiConfiguration')}
          </div>
          <div 
            className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            🎨 {t('settings.appearance')}
          </div>
          <div 
            className={`tab ${activeTab === 'mcp' ? 'active' : ''}`}
            onClick={() => setActiveTab('mcp')}
          >
            🔌 {t('settings.mcpServers')}
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'api' && (
            <>
              <div className="form-group">
                <label>{t('settings.aiProvider')}</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="azure">Azure OpenAI</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('settings.apiKey')}</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
              </div>

              <div className="form-group">
                <label>{t('settings.model')}</label>
                {provider !== 'azure' ? (
                  <select value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value="">-- Select a model --</option>
                    {modelPresets[provider as keyof typeof modelPresets].map((m: string) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Azure deployment name, e.g., my-gpt4o"
                  />
                )}
              </div>

              {provider === 'azure' && (
                <>
                  <div className="form-group">
                    <label>{t('settings.azureEndpoint')}</label>
                    <input
                      type="text"
                      value={azureEndpoint}
                      onChange={(e) => setAzureEndpoint(e.target.value)}
                      placeholder="https://your-resource.openai.azure.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('settings.azureApiVersion')}</label>
                    <input
                      type="text"
                      value={azureApiVersion}
                      onChange={(e) => setAzureApiVersion(e.target.value)}
                      placeholder="e.g., 2024-02-15-preview"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>{t('settings.temperature')}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                />
                <small style={{ color: '#888', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  Lower = deterministic, Higher = creative
                </small>
              </div>

              <div className="form-group">
                <label>{t('settings.maxTokens')}</label>
                <input
                  type="number"
                  min="1"
                  max="8192"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <button className="btn-primary" onClick={handleSaveAPI}>
                💾 {t('settings.saveApiSettings')}
              </button>
            </>
          )}

          {activeTab === 'appearance' && (
            <>
              <div className="form-group">
                <label>{t('settings.uiTheme')}</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
                  <option value="dark">🌙 {t('settings.dark')}</option>
                  <option value="light">☀️ {t('settings.light')}</option>
                </select>
                <small style={{ color: '#888', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {t('settings.uiTheme')}
                </small>
              </div>

              <div className="form-group">
                <label>{t('settings.editorTheme')}</label>
                <select value={editorTheme} onChange={(e) => setEditorTheme(e.target.value)}>
                  <optgroup label={`🌙 ${t('settings.darkThemes')}`}>
                    <option value="vs-dark">VS Dark (Default)</option>
                    <option value="hc-black">High Contrast Dark</option>
                  </optgroup>
                  <optgroup label={`☀️ ${t('settings.lightThemes')}`}>
                    <option value="vs">VS Light</option>
                    <option value="hc-light">High Contrast Light</option>
                  </optgroup>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {t('settings.themeTip')}
                </p>
              </div>

              <div className="form-group">
                <label>{t('settings.fontFamily')}</label>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                  <option value="'Consolas', 'Monaco', 'Courier New', monospace">Consolas (Default)</option>
                  <option value="'Fira Code', 'Consolas', monospace">Fira Code</option>
                  <option value="'JetBrains Mono', 'Consolas', monospace">JetBrains Mono</option>
                  <option value="'Source Code Pro', 'Consolas', monospace">Source Code Pro</option>
                  <option value="'Monaco', 'Courier New', monospace">Monaco</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="monospace">System Monospace</option>
                </select>
                <small style={{ color: '#888', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {t('settings.fontTip')}
                </small>
              </div>

              <div className="form-group">
                <label>{t('settings.fontSize')}: {fontSize}px</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                  <span>10px</span>
                  <span>14px ({t('settings.defaultValue')})</span>
                  <span>24px</span>
                </div>
              </div>

              <div className="form-group">
                <label>{t('settings.lineHeight')}: {lineHeight}</label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                  <span>{t('settings.compact')} (1.0)</span>
                  <span>{t('settings.normal')} (1.5)</span>
                  <span>{t('settings.spacious')} (2.5)</span>
                </div>
              </div>

              <div className="form-group">
                <label>{t('settings.displayLanguage')}</label>
                <select value={locale} onChange={(e) => setLocale(e.target.value as 'zh-CN' | 'en-US')}>
                  <option value="zh-CN">🇨🇳 简体中文 (Simplified Chinese)</option>
                  <option value="en-US">🇺🇸 English (United States)</option>
                </select>
                <small style={{ color: '#888', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {t('settings.restartRequired')}
                </small>
              </div>

              <button className="btn-primary" onClick={handleSaveAppearance}>
                💾 {t('settings.saveAppearance')}
              </button>
            </>
          )}

          {activeTab === 'mcp' && (
            <>
              <div className="form-group">
                <label>{t('settings.mcpServerName')}</label>
                <input
                  type="text"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="e.g., File System"
                />
              </div>

              <div className="form-group">
                <label>{t('settings.mcpCommand')}</label>
                <input
                  type="text"
                  value={newServerCommand}
                  onChange={(e) => setNewServerCommand(e.target.value)}
                  placeholder="e.g., node"
                />
              </div>

              <div className="form-group">
                <label>{t('settings.mcpArguments')}</label>
                <input
                  type="text"
                  value={newServerArgs}
                  onChange={(e) => setNewServerArgs(e.target.value)}
                  placeholder="e.g., path/to/server.js --port 3000"
                />
              </div>

              <button className="btn-primary" onClick={handleAddMCPServer}>
                {t('settings.mcpAddServer')}
              </button>

              <div className="mcp-server-list">
                <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>{t('settings.mcpActiveServers')}</h3>
                {mcpServers.length === 0 && (
                  <p style={{ color: '#888', fontSize: '13px' }}>{t('settings.mcpNoServers')}</p>
                )}
                {mcpServers.map(server => (
                  <div key={server.id} className="mcp-server-item">
                    <div>
                      <strong>{server.name}</strong>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {server.command} {server.args.join(' ')}
                      </div>
                    </div>
                    <button 
                      className="btn-danger"
                      onClick={() => handleRemoveMCPServer(server.id)}
                    >
                      {t('settings.mcpRemove')}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

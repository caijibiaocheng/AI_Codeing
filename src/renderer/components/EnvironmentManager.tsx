/**
 * 环境变量管理器
 * 管理不同环境的配置，支持加密敏感信息
 */
import React, { useState, useEffect } from 'react';

interface Environment {
  id: string;
  name: string;
  description?: string;
  variables: EnvironmentVariable[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
  isSecret: boolean;
  isEncrypted: boolean;
  type: 'string' | 'number' | 'boolean' | 'json';
}

const EnvironmentManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingEnvironment, setIsCreatingEnvironment] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState('');
  const [newEnvironmentDescription, setNewEnvironmentDescription] = useState('');
  const [isCreatingVariable, setIsCreatingVariable] = useState(false);
  const [editingVariable, setEditingVariable] = useState<EnvironmentVariable | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      if (window.electronAPI) {
        const envs = await window.electronAPI.getEnvironments();
        setEnvironments(envs);
        const active = envs.find(env => env.isActive);
        if (active) {
          setSelectedEnvironment(active);
        }
      } else {
        // 默认环境数据
        const defaultEnvironments: Environment[] = [
          {
            id: 'development',
            name: 'Development',
            description: '开发环境配置',
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            variables: [
              {
                id: 'dev-1',
                key: 'NODE_ENV',
                value: 'development',
                description: '运行环境',
                isSecret: false,
                isEncrypted: false,
                type: 'string'
              },
              {
                id: 'dev-2',
                key: 'API_URL',
                value: 'http://localhost:3000/api',
                description: 'API服务器地址',
                isSecret: false,
                isEncrypted: false,
                type: 'string'
              },
              {
                id: 'dev-3',
                key: 'DEBUG',
                value: 'true',
                description: '调试模式',
                isSecret: false,
                isEncrypted: false,
                type: 'boolean'
              }
            ]
          },
          {
            id: 'production',
            name: 'Production',
            description: '生产环境配置',
            isActive: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            variables: [
              {
                id: 'prod-1',
                key: 'NODE_ENV',
                value: 'production',
                description: '运行环境',
                isSecret: false,
                isEncrypted: false,
                type: 'string'
              },
              {
                id: 'prod-2',
                key: 'API_URL',
                value: 'https://api.example.com',
                description: 'API服务器地址',
                isSecret: false,
                isEncrypted: false,
                type: 'string'
              },
              {
                id: 'prod-3',
                key: 'DATABASE_URL',
                value: 'encrypted:postgresql://user:pass@host:5432/db',
                description: '数据库连接字符串',
                isSecret: true,
                isEncrypted: true,
                type: 'string'
              }
            ]
          }
        ];
        setEnvironments(defaultEnvironments);
        setSelectedEnvironment(defaultEnvironments[0]);
      }
    } catch (error) {
      console.error('[EnvironmentManager] Failed to load environments:', error);
    }
  };

  const createEnvironment = async () => {
    if (!newEnvironmentName.trim()) return;

    const newEnvironment: Environment = {
      id: `env-${Date.now()}`,
      name: newEnvironmentName.trim(),
      description: newEnvironmentDescription.trim(),
      isActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      variables: []
    };

    try {
      if (window.electronAPI) {
        await window.electronAPI.saveEnvironment(newEnvironment);
      }
      
      setEnvironments(prev => [...prev, newEnvironment]);
      setNewEnvironmentName('');
      setNewEnvironmentDescription('');
      setIsCreatingEnvironment(false);
    } catch (error) {
      console.error('[EnvironmentManager] Failed to create environment:', error);
    }
  };

  const createVariable = async (variable: Omit<EnvironmentVariable, 'id'>) => {
    if (!selectedEnvironment || !variable.key.trim()) return;

    const newVariable: EnvironmentVariable = {
      ...variable,
      id: `var-${Date.now()}`,
      key: variable.key.trim()
    };

    try {
      if (window.electronAPI) {
        await window.electronAPI.addEnvironmentVariable(selectedEnvironment.id, newVariable);
      }
      
      const updatedEnvironment = {
        ...selectedEnvironment,
        variables: [...selectedEnvironment.variables, newVariable],
        updatedAt: Date.now()
      };
      
      setEnvironments(prev => prev.map(env => 
        env.id === selectedEnvironment.id ? updatedEnvironment : env
      ));
      setSelectedEnvironment(updatedEnvironment);
      setIsCreatingVariable(false);
    } catch (error) {
      console.error('[EnvironmentManager] Failed to create variable:', error);
    }
  };

  const updateVariable = async (variableId: string, updates: Partial<EnvironmentVariable>) => {
    if (!selectedEnvironment) return;

    try {
      if (window.electronAPI) {
        await window.electronAPI.updateEnvironmentVariable(selectedEnvironment.id, variableId, updates);
      }
      
      const updatedEnvironment = {
        ...selectedEnvironment,
        variables: selectedEnvironment.variables.map(v => 
          v.id === variableId ? { ...v, ...updates } : v
        ),
        updatedAt: Date.now()
      };
      
      setEnvironments(prev => prev.map(env => 
        env.id === selectedEnvironment.id ? updatedEnvironment : env
      ));
      setSelectedEnvironment(updatedEnvironment);
    } catch (error) {
      console.error('[EnvironmentManager] Failed to update variable:', error);
    }
  };

  const deleteVariable = async (variableId: string) => {
    if (!selectedEnvironment) return;

    try {
      if (window.electronAPI) {
        await window.electronAPI.deleteEnvironmentVariable(selectedEnvironment.id, variableId);
      }
      
      const updatedEnvironment = {
        ...selectedEnvironment,
        variables: selectedEnvironment.variables.filter(v => v.id !== variableId),
        updatedAt: Date.now()
      };
      
      setEnvironments(prev => prev.map(env => 
        env.id === selectedEnvironment.id ? updatedEnvironment : env
      ));
      setSelectedEnvironment(updatedEnvironment);
    } catch (error) {
      console.error('[EnvironmentManager] Failed to delete variable:', error);
    }
  };

  const switchEnvironment = async (environmentId: string) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.switchEnvironment(environmentId);
      }
      
      setEnvironments(prev => prev.map(env => ({
        ...env,
        isActive: env.id === environmentId
      })));
      
      const environment = environments.find(env => env.id === environmentId);
      if (environment) {
        setSelectedEnvironment(environment);
      }
    } catch (error) {
      console.error('[EnvironmentManager] Failed to switch environment:', error);
    }
  };

  const exportEnvironment = async () => {
    if (!selectedEnvironment) return;

    try {
      if (window.electronAPI) {
        await window.electronAPI.exportEnvironment(selectedEnvironment.id);
      }
    } catch (error) {
      console.error('[EnvironmentManager] Failed to export environment:', error);
    }
  };

  const importEnvironment = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.importEnvironment();
        if (result) {
          await loadEnvironments();
        }
      }
    } catch (error) {
      console.error('[EnvironmentManager] Failed to import environment:', error);
    }
  };

  const toggleSecretVisibility = (variableId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [variableId]: !prev[variableId]
    }));
  };

  const renderValue = (variable: EnvironmentVariable) => {
    if (variable.isSecret && !showSecrets[variable.id]) {
      return '••••••••';
    }
    
    if (variable.isEncrypted && variable.value.startsWith('encrypted:')) {
      return variable.value.replace('encrypted:', showSecrets[variable.id] ? '' : '••••••••');
    }
    
    return variable.value;
  };

  return (
    <div className="side-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>🌍</span>
          <span>环境变量管理</span>
        </div>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>

      <div className="panel-toolbar">
        <input
          type="text"
          className="panel-search"
          placeholder="搜索环境变量..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="toolbar-button" onClick={exportEnvironment}>导出</button>
        <button className="toolbar-button" onClick={importEnvironment}>导入</button>
      </div>

      <div className="panel-content">
        {/* 环境列表 */}
        <div className="environments-section">
          <div className="section-header">
            <h3>环境</h3>
            <button 
              className="add-button"
              onClick={() => setIsCreatingEnvironment(true)}
            >
              + 新建环境
            </button>
          </div>
          
          <div className="environments-list">
            {environments.map(env => (
              <div
                key={env.id}
                className={`environment-item ${env.isActive ? 'active' : ''} ${selectedEnvironment?.id === env.id ? 'selected' : ''}`}
                onClick={() => setSelectedEnvironment(env)}
              >
                <div className="environment-info">
                  <div className="environment-name">{env.name}</div>
                  {env.description && (
                    <div className="environment-description">{env.description}</div>
                  )}
                </div>
                <div className="environment-actions">
                  {env.isActive && (
                    <span className="active-badge">当前</span>
                  )}
                  {!env.isActive && (
                    <button 
                      className="switch-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        switchEnvironment(env.id);
                      }}
                    >
                      切换
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isCreatingEnvironment && (
            <div className="create-environment-form">
              <input
                type="text"
                placeholder="环境名称"
                value={newEnvironmentName}
                onChange={(e) => setNewEnvironmentName(e.target.value)}
                className="form-input"
              />
              <input
                type="text"
                placeholder="环境描述（可选）"
                value={newEnvironmentDescription}
                onChange={(e) => setNewEnvironmentDescription(e.target.value)}
                className="form-input"
              />
              <div className="form-actions">
                <button 
                  className="save-button"
                  onClick={createEnvironment}
                  disabled={!newEnvironmentName.trim()}
                >
                  创建
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setIsCreatingEnvironment(false);
                    setNewEnvironmentName('');
                    setNewEnvironmentDescription('');
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 变量列表 */}
        {selectedEnvironment && (
          <div className="variables-section">
            <div className="section-header">
              <h3>{selectedEnvironment.name} - 变量</h3>
              <button 
                className="add-button"
                onClick={() => setIsCreatingVariable(true)}
              >
                + 新建变量
              </button>
            </div>
            
            <div className="variables-list">
              {selectedEnvironment.variables
                .filter(v => 
                  v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  v.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(variable => (
                <div key={variable.id} className="variable-item">
                  <div className="variable-info">
                    <div className="variable-key">{variable.key}</div>
                    {variable.description && (
                      <div className="variable-description">{variable.description}</div>
                    )}
                    <div className="variable-type">{variable.type}</div>
                  </div>
                  <div className="variable-value-section">
                    <div className="variable-value">
                      <input
                        type={variable.isSecret && !showSecrets[variable.id] ? 'password' : 'text'}
                        value={editingVariable?.id === variable.id ? editingVariable.value : renderValue(variable)}
                        onChange={(e) => {
                          if (editingVariable?.id === variable.id) {
                            setEditingVariable({ ...editingVariable, value: e.target.value });
                          }
                        }}
                        disabled={editingVariable?.id !== variable.id}
                        className="value-input"
                      />
                      {variable.isSecret && (
                        <button 
                          className="reveal-button"
                          onClick={() => toggleSecretVisibility(variable.id)}
                        >
                          {showSecrets[variable.id] ? '👁️' : '👁️‍🗨️'}
                        </button>
                      )}
                    </div>
                    <div className="variable-actions">
                      {editingVariable?.id === variable.id ? (
                        <>
                          <button 
                            className="save-button"
                            onClick={() => {
                              updateVariable(variable.id, editingVariable);
                              setEditingVariable(null);
                            }}
                          >
                            保存
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={() => setEditingVariable(null)}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="edit-button"
                            onClick={() => setEditingVariable(variable)}
                          >
                            编辑
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => deleteVariable(variable.id)}
                          >
                            删除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isCreatingVariable && (
              <VariableForm
                onSubmit={createVariable}
                onCancel={() => setIsCreatingVariable(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface VariableFormProps {
  onSubmit: (variable: Omit<EnvironmentVariable, 'id'>) => void;
  onCancel: () => void;
}

const VariableForm: React.FC<VariableFormProps> = ({ onSubmit, onCancel }) => {
  const [variable, setVariable] = useState<Omit<EnvironmentVariable, 'id'>>({
    key: '',
    value: '',
    description: '',
    isSecret: false,
    isEncrypted: false,
    type: 'string'
  });

  const handleSubmit = () => {
    if (!variable.key.trim()) return;
    onSubmit(variable);
    setVariable({
      key: '',
      value: '',
      description: '',
      isSecret: false,
      isEncrypted: false,
      type: 'string'
    });
  };

  return (
    <div className="create-variable-form">
      <input
        type="text"
        placeholder="变量名"
        value={variable.key}
        onChange={(e) => setVariable({ ...variable, key: e.target.value })}
        className="form-input"
      />
      <input
        type="text"
        placeholder="变量值"
        value={variable.value}
        onChange={(e) => setVariable({ ...variable, value: e.target.value })}
        className="form-input"
      />
      <input
        type="text"
        placeholder="描述（可选）"
        value={variable.description}
        onChange={(e) => setVariable({ ...variable, description: e.target.value })}
        className="form-input"
      />
      <div className="form-options">
        <label>
          <input
            type="checkbox"
            checked={variable.isSecret}
            onChange={(e) => setVariable({ ...variable, isSecret: e.target.checked })}
          />
          敏感信息
        </label>
        <label>
          <input
            type="checkbox"
            checked={variable.isEncrypted}
            onChange={(e) => setVariable({ ...variable, isEncrypted: e.target.checked })}
          />
          加密存储
        </label>
        <select
          value={variable.type}
          onChange={(e) => setVariable({ ...variable, type: e.target.value as any })}
          className="type-select"
        >
          <option value="string">字符串</option>
          <option value="number">数字</option>
          <option value="boolean">布尔值</option>
          <option value="json">JSON</option>
        </select>
      </div>
      <div className="form-actions">
        <button 
          className="save-button"
          onClick={handleSubmit}
          disabled={!variable.key.trim()}
        >
          创建
        </button>
        <button className="cancel-button" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
};

export default EnvironmentManager;
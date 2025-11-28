/**
 * 自定义快捷键管理器
 * 允许用户自定义和管理键盘快捷键
 */
import React, { useState, useEffect } from 'react';

interface KeyBinding {
  id: string;
  command: string;
  keybinding: string;
  description: string;
  category: 'editor' | 'panel' | 'navigation' | 'tools' | 'custom';
  isDefault: boolean;
  isUserDefined: boolean;
}

const KeyBindingsManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [bindings, setBindings] = useState<KeyBinding[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingBinding, setEditingBinding] = useState<KeyBinding | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // 默认快捷键配置
  const defaultBindings: KeyBinding[] = [
    // 编辑器相关
    { id: 'editor.save', command: 'editor.save', keybinding: 'Ctrl+S', description: '保存文件', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.saveAs', command: 'editor.saveAs', keybinding: 'Ctrl+Shift+S', description: '另存为', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.undo', command: 'editor.undo', keybinding: 'Ctrl+Z', description: '撤销', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.redo', command: 'editor.redo', keybinding: 'Ctrl+Y', description: '重做', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.cut', command: 'editor.cut', keybinding: 'Ctrl+X', description: '剪切', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.copy', command: 'editor.copy', keybinding: 'Ctrl+C', description: '复制', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.paste', command: 'editor.paste', keybinding: 'Ctrl+V', description: '粘贴', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.selectAll', command: 'editor.selectAll', keybinding: 'Ctrl+A', description: '全选', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.find', command: 'editor.find', keybinding: 'Ctrl+F', description: '查找', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.replace', command: 'editor.replace', keybinding: 'Ctrl+H', description: '替换', category: 'editor', isDefault: true, isUserDefined: false },
    { id: 'editor.format', command: 'editor.format', keybinding: 'Shift+Alt+F', description: '格式化代码', category: 'editor', isDefault: true, isUserDefined: false },
    
    // 面板相关
    { id: 'panel.commandPalette', command: 'panel.commandPalette', keybinding: 'Ctrl+Shift+P', description: '命令面板', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.terminal', command: 'panel.terminal', keybinding: 'Ctrl+`', description: '终端', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.settings', command: 'panel.settings', keybinding: 'Ctrl+,', description: '设置', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.git', command: 'panel.git', keybinding: 'Ctrl+Shift+G', description: 'Git面板', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.search', command: 'panel.search', keybinding: 'Ctrl+Shift+F', description: '全局搜索', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.extensions', command: 'panel.extensions', keybinding: 'Ctrl+Shift+X', description: '扩展', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.aiAssistant', command: 'panel.aiAssistant', keybinding: 'Ctrl+Shift+L', description: 'AI助手', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.recentFiles', command: 'panel.recentFiles', keybinding: 'Ctrl+Shift+R', description: '最近文件', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.outline', command: 'panel.outline', keybinding: 'Ctrl+Shift+O', description: '代码大纲', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.problems', command: 'panel.problems', keybinding: 'Ctrl+Shift+D', description: '问题诊断', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.todo', command: 'panel.todo', keybinding: 'Ctrl+Shift+T', description: 'TODO列表', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.bookmark', command: 'panel.bookmark', keybinding: 'Ctrl+Shift+B', description: '书签', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.snippet', command: 'panel.snippet', keybinding: 'Ctrl+Shift+I', description: '代码片段', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.metrics', command: 'panel.metrics', keybinding: 'Ctrl+Shift+M', description: '代码指标', category: 'panel', isDefault: true, isUserDefined: false },
    { id: 'panel.templates', command: 'panel.templates', keybinding: 'Ctrl+Shift+N', description: '项目模板', category: 'panel', isDefault: true, isUserDefined: false },
    
    // 导航相关
    { id: 'navigation.quickOpen', command: 'navigation.quickOpen', keybinding: 'Ctrl+P', description: '快速打开文件', category: 'navigation', isDefault: true, isUserDefined: false },
    { id: 'navigation.gotoLine', command: 'navigation.gotoLine', keybinding: 'Ctrl+G', description: '跳转到行', category: 'navigation', isDefault: true, isUserDefined: false },
    { id: 'navigation.gotoSymbol', command: 'navigation.gotoSymbol', keybinding: 'Ctrl+Shift+O', description: '跳转到符号', category: 'navigation', isDefault: true, isUserDefined: false },
    { id: 'navigation.back', command: 'navigation.back', keybinding: 'Alt+Left', description: '后退', category: 'navigation', isDefault: true, isUserDefined: false },
    { id: 'navigation.forward', command: 'navigation.forward', keybinding: 'Alt+Right', description: '前进', category: 'navigation', isDefault: true, isUserDefined: false },
    { id: 'navigation.toggleSidebar', command: 'navigation.toggleSidebar', keybinding: 'Ctrl+B', description: '切换侧边栏', category: 'navigation', isDefault: true, isUserDefined: false },
    
    // 工具相关
    { id: 'tools.toggleTheme', command: 'tools.toggleTheme', keybinding: 'Ctrl+K Ctrl+T', description: '切换主题', category: 'tools', isDefault: true, isUserDefined: false },
    { id: 'tools.newFile', command: 'tools.newFile', keybinding: 'Ctrl+N', description: '新建文件', category: 'tools', isDefault: true, isUserDefined: false },
    { id: 'tools.openFile', command: 'tools.openFile', keybinding: 'Ctrl+O', description: '打开文件', category: 'tools', isDefault: true, isUserDefined: false },
    { id: 'tools.closeFile', command: 'tools.closeFile', keybinding: 'Ctrl+W', description: '关闭文件', category: 'tools', isDefault: true, isUserDefined: false },
    { id: 'tools.closeAllFiles', command: 'tools.closeAllFiles', keybinding: 'Ctrl+K Ctrl+W', description: '关闭所有文件', category: 'tools', isDefault: true, isUserDefined: false },
    { id: 'tools.reloadWindow', command: 'tools.reloadWindow', keybinding: 'Ctrl+R', description: '重新加载窗口', category: 'tools', isDefault: true, isUserDefined: false },
  ];

  useEffect(() => {
    loadKeyBindings();
  }, []);

  const loadKeyBindings = async () => {
    try {
      if (window.electronAPI) {
        const userBindings = await window.electronAPI.getKeyBindings();
        setBindings([...defaultBindings, ...userBindings]);
      } else {
        setBindings(defaultBindings);
      }
    } catch (error) {
      console.error('[KeyBindingsManager] Failed to load key bindings:', error);
      setBindings(defaultBindings);
    }
  };

  const filteredBindings = bindings.filter(binding => {
    const matchesSearch = binding.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         binding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         binding.keybinding.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || binding.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'editor', label: '编辑器' },
    { value: 'panel', label: '面板' },
    { value: 'navigation', label: '导航' },
    { value: 'tools', label: '工具' },
    { value: 'custom', label: '自定义' }
  ];

  const startRecording = (binding: KeyBinding) => {
    setEditingBinding(binding);
    setIsRecording(true);
    setRecordedKeys([]);
    setConflicts([]);

    // 监听键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      const key = e.key;
      const modifiers = [];
      
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.metaKey) modifiers.push('Meta');
      
      // 忽略单独的修饰键
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
        return;
      }
      
      const keybinding = [...modifiers, key].join('+');
      setRecordedKeys([...modifiers, key]);
      
      // 检查冲突
      const existingBinding = bindings.find(b => 
        b.keybinding === keybinding && b.id !== binding.id
      );
      
      if (existingBinding) {
        setConflicts([existingBinding.command]);
      } else {
        setConflicts([]);
      }
      
      // 延迟停止录制，避免立即触发其他快捷键
      setTimeout(() => {
        stopRecording();
      }, 100);
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // 保存事件监听器引用以便清理
    (window as any)._keyBindingHandler = handleKeyDown;
  };

  const stopRecording = () => {
    setIsRecording(false);
    if ((window as any)._keyBindingHandler) {
      document.removeEventListener('keydown', (window as any)._keyBindingHandler);
      delete (window as any)._keyBindingHandler;
    }
  };

  const saveKeyBinding = async () => {
    if (!editingBinding || recordedKeys.length === 0 || conflicts.length > 0) {
      return;
    }

    const newKeybinding = recordedKeys.join('+');
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.saveKeyBinding(editingBinding.id, newKeybinding);
      }
      
      // 更新本地状态
      setBindings(prev => prev.map(binding => 
        binding.id === editingBinding.id 
          ? { ...binding, keybinding: newKeybinding, isUserDefined: true }
          : binding
      ));
      
      setEditingBinding(null);
      setRecordedKeys([]);
    } catch (error) {
      console.error('[KeyBindingsManager] Failed to save key binding:', error);
    }
  };

  const resetToDefault = async (bindingId: string) => {
    const defaultBinding = defaultBindings.find(b => b.id === bindingId);
    if (!defaultBinding) return;

    try {
      if (window.electronAPI) {
        await window.electronAPI.resetKeyBinding(bindingId);
      }
      
      setBindings(prev => prev.map(binding => 
        binding.id === bindingId 
          ? { ...binding, keybinding: defaultBinding.keybinding, isUserDefined: false }
          : binding
      ));
    } catch (error) {
      console.error('[KeyBindingsManager] Failed to reset key binding:', error);
    }
  };

  const exportKeyBindings = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.exportKeyBindings(bindings);
      }
    } catch (error) {
      console.error('[KeyBindingsManager] Failed to export key bindings:', error);
    }
  };

  const importKeyBindings = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.importKeyBindings();
        if (result) {
          await loadKeyBindings();
        }
      }
    } catch (error) {
      console.error('[KeyBindingsManager] Failed to import key bindings:', error);
    }
  };

  return (
    <div className="side-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>⌨️</span>
          <span>快捷键管理</span>
        </div>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>

      <div className="panel-toolbar">
        <input
          type="text"
          className="panel-search"
          placeholder="搜索快捷键..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="panel-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <button className="toolbar-button" onClick={exportKeyBindings}>导出</button>
        <button className="toolbar-button" onClick={importKeyBindings}>导入</button>
      </div>

      <div className="panel-content">
        <div className="keybindings-list">
          {filteredBindings.map(binding => (
            <div key={binding.id} className="keybinding-item">
              <div className="keybinding-info">
                <div className="keybinding-command">{binding.command}</div>
                <div className="keybinding-description">{binding.description}</div>
                {binding.isUserDefined && (
                  <span className="keybinding-custom-badge">自定义</span>
                )}
              </div>
              <div className="keybinding-actions">
                {editingBinding?.id === binding.id ? (
                  <div className="keybinding-editor">
                    {isRecording ? (
                      <div className="key-recording">
                        <span className="recording-indicator">● 录制中...</span>
                        <span className="recorded-keys">
                          {recordedKeys.length > 0 ? recordedKeys.join(' + ') : '按下快捷键...'}
                        </span>
                        {conflicts.length > 0 && (
                          <div className="conflict-warning">
                            ⚠️ 与 {conflicts.join(', ')} 冲突
                          </div>
                        )}
                        <button 
                          className="cancel-button"
                          onClick={() => {
                            stopRecording();
                            setEditingBinding(null);
                            setRecordedKeys([]);
                          }}
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="keybinding-display">
                        <span className="keybinding-keys">{recordedKeys.join(' + ') || binding.keybinding}</span>
                        <div className="keybinding-buttons">
                          <button 
                            className="save-button"
                            onClick={saveKeyBinding}
                            disabled={recordedKeys.length === 0 || conflicts.length > 0}
                          >
                            保存
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={() => {
                              setEditingBinding(null);
                              setRecordedKeys([]);
                            }}
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="keybinding-display">
                    <kbd className="keybinding-keys">{binding.keybinding}</kbd>
                    <div className="keybinding-buttons">
                      <button 
                        className="edit-button"
                        onClick={() => startRecording(binding)}
                      >
                        编辑
                      </button>
                      {binding.isUserDefined && (
                        <button 
                          className="reset-button"
                          onClick={() => resetToDefault(binding.id)}
                        >
                          重置
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyBindingsManager;
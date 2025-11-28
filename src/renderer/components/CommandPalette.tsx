import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  keywords?: string[];
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands?: Command[];
  theme?: 'light' | 'dark';
}

const defaultCommands: Command[] = [
  {
    id: 'file.new',
    title: '新建文件',
    description: '创建一个新的文件',
    icon: '📄',
    category: '文件',
    keywords: ['new', 'create', '文件'],
    action: () => console.log('新建文件')
  },
  {
    id: 'file.open',
    title: '打开文件',
    description: '打开一个已存在的文件',
    icon: '📂',
    category: '文件',
    keywords: ['open', '文件'],
    action: () => console.log('打开文件')
  },
  {
    id: 'file.save',
    title: '保存文件',
    description: '保存当前文件',
    icon: '💾',
    category: '文件',
    keywords: ['save', '保存'],
    action: () => console.log('保存文件')
  },
  {
    id: 'file.saveAll',
    title: '保存所有文件',
    description: '保存所有已打开的文件',
    icon: '💾',
    category: '文件',
    keywords: ['save all', '保存所有'],
    action: () => console.log('保存所有文件')
  },
  {
    id: 'edit.find',
    title: '查找',
    description: '在当前文件中查找文本',
    icon: '🔍',
    category: '编辑',
    keywords: ['find', 'search', '查找'],
    action: () => console.log('查找')
  },
  {
    id: 'edit.replace',
    title: '替换',
    description: '查找并替换文本',
    icon: '🔄',
    category: '编辑',
    keywords: ['replace', '替换'],
    action: () => console.log('替换')
  },
  {
    id: 'edit.format',
    title: '格式化代码',
    description: '格式化当前文件的代码',
    icon: '✨',
    category: '编辑',
    keywords: ['format', '格式化'],
    action: () => console.log('格式化代码')
  },
  {
    id: 'view.toggleSidebar',
    title: '切换侧边栏',
    description: '显示或隐藏侧边栏',
    icon: '📱',
    category: '视图',
    keywords: ['sidebar', '侧边栏'],
    action: () => console.log('切换侧边栏')
  },
  {
    id: 'view.toggleTerminal',
    title: '切换终端',
    description: '显示或隐藏终端',
    icon: '⌨️',
    category: '视图',
    keywords: ['terminal', '终端'],
    action: () => console.log('切换终端')
  },
  {
    id: 'git.commit',
    title: 'Git 提交',
    description: '提交当前更改',
    icon: '🔀',
    category: 'Git',
    keywords: ['git', 'commit', '提交'],
    action: () => console.log('Git 提交')
  },
  {
    id: 'git.push',
    title: 'Git 推送',
    description: '推送到远程仓库',
    icon: '📤',
    category: 'Git',
    keywords: ['git', 'push', '推送'],
    action: () => console.log('Git 推送')
  },
  {
    id: 'extensions.install',
    title: '安装扩展',
    description: '安装新的扩展',
    icon: '📦',
    category: '扩展',
    keywords: ['extension', 'install', '扩展'],
    action: () => console.log('安装扩展')
  },
  {
    id: 'settings.open',
    title: '打开设置',
    description: '打开编辑器设置',
    icon: '⚙️',
    category: '设置',
    keywords: ['settings', 'preference', '设置'],
    action: () => console.log('打开设置')
  },
  {
    id: 'help.about',
    title: '关于',
    description: '查看关于信息',
    icon: 'ℹ️',
    category: '帮助',
    keywords: ['about', '关于'],
    action: () => console.log('关于')
  }
];

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands = defaultCommands,
  theme = 'dark'
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(commands);
  const inputRef = useRef<HTMLInputElement>(null);

  // 过滤命令
  useEffect(() => {
    if (!query.trim()) {
      setFilteredCommands(commands);
      setSelectedIndex(0);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = commands.filter(cmd => {
      const titleMatch = cmd.title.toLowerCase().includes(lowerQuery);
      const descMatch = cmd.description?.toLowerCase().includes(lowerQuery);
      const keywordMatch = cmd.keywords?.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      );
      const categoryMatch = cmd.category?.toLowerCase().includes(lowerQuery);
      
      return titleMatch || descMatch || keywordMatch || categoryMatch;
    });

    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [query, commands]);

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 键盘事件处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // 执行命令
  const executeCommand = (command: Command) => {
    command.action();
    onClose();
  };

  if (!isOpen) return null;

  // 按类别分组
  const groupedCommands = filteredCommands.reduce((groups, cmd) => {
    const category = cmd.category || '其他';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(cmd);
    return groups;
  }, {} as Record<string, Command[]>);

  return (
    <div className="command-palette-overlay">
      <div className="command-palette">
        <div className="command-palette-header">
          <span className="command-palette-icon">⚡</span>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="输入命令或搜索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <div className="command-palette-list">
          {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
            <div key={category} className="command-category">
              <div className="command-category-header">{category}</div>
              {categoryCommands.map((cmd, index) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                const isSelected = globalIndex === selectedIndex;
                
                return (
                  <div
                    key={cmd.id}
                    className={`command-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                  >
                    <div className="command-item-main">
                      <span className="command-icon">{cmd.icon}</span>
                      <span className="command-title">{cmd.title}</span>
                    </div>
                    {cmd.description && (
                      <span className="command-description">{cmd.description}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="command-empty">
              <span>没有找到匹配的命令</span>
            </div>
          )}
        </div>
        
        <div className="command-palette-footer">
          <span className="command-hint">↑↓ 导航</span>
          <span className="command-hint">Enter 执行</span>
          <span className="command-hint">Esc 关闭</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
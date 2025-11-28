import React from 'react';

interface SidebarItem {
  id: string;
  icon: string;
  title: string;
  active?: boolean;
  onClick: () => void;
  badge?: string | number;
  disabled?: boolean;
  group?: string;
}

interface EnhancedSidebarProps {
  items: SidebarItem[];
  theme?: 'light' | 'dark';
  compact?: boolean;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  items, 
  theme = 'dark',
  compact = false 
}) => {
  // 按组分类项目
  const groupedItems = items.reduce((groups, item) => {
    const group = item.group || 'main';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, SidebarItem[]>);

  const groupOrder = ['main', 'development', 'ai', 'tools', 'settings'];

  return (
    <div className={`enhanced-sidebar ${compact ? 'compact' : ''}`}>
      {groupOrder.map(groupName => {
        const groupItems = groupedItems[groupName];
        if (!groupItems || groupItems.length === 0) return null;

        return (
          <div key={groupName} className="sidebar-group">
            {!compact && (
              <div className="sidebar-group-title">
                {groupName === 'main' && '主要'}
                {groupName === 'development' && '开发'}
                {groupName === 'ai' && 'AI'}
                {groupName === 'tools' && '工具'}
                {groupName === 'settings' && '设置'}
              </div>
            )}
            <div className="sidebar-items">
              {groupItems.map((item) => (
                <div
                  key={item.id}
                  className={`sidebar-item ${item.active ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                  onClick={item.disabled ? undefined : item.onClick}
                  title={item.title}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                  {item.active && (
                    <div className="sidebar-item-indicator" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnhancedSidebar;
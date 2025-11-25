import React, { useEffect, useRef } from 'react';
import './ContextMenu.css';

export interface MenuItem {
  label?: string;
  action?: () => void;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onClose();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onClose]);

  // 调整菜单位置，确保不超出屏幕
  const adjustedStyle: React.CSSProperties = {
    left: x,
    top: y,
  };

  if (menuRef.current) {
    const rect = menuRef.current.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
      adjustedStyle.left = window.innerWidth - rect.width - 10;
    }
    if (y + rect.height > window.innerHeight) {
      adjustedStyle.top = window.innerHeight - rect.height - 10;
    }
  }

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled && item.action) {
      item.action();
      onClose();
    }
  };

  return (
    <div 
      ref={menuRef}
      className="context-menu" 
      style={adjustedStyle}
    >
      {items.map((item, index) => (
        item.separator ? (
          <div key={`separator-${index}`} className="context-menu-separator" />
        ) : (
          <div
            key={index}
            className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            {item.icon && <span className="context-menu-icon">{item.icon}</span>}
            <span className="context-menu-label">{item.label}</span>
          </div>
        )
      ))}
    </div>
  );
};

export default ContextMenu;

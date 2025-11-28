import React, { useState, useRef, useEffect } from 'react';

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string | number;
}

interface QuickActionsProps {
  actions: QuickAction[];
  theme?: 'light' | 'dark';
  orientation?: 'horizontal' | 'vertical';
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  theme = 'dark',
  orientation = 'horizontal'
}) => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  const handleActionMouseEnter = (actionId: string) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(actionId);
    }, 500);
  };

  const handleActionMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(null);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`quick-actions quick-actions-${orientation}`}>
      {actions.map((action) => (
        <div key={action.id} className="quick-action-wrapper">
          <button
            className={`quick-action ${action.disabled ? 'disabled' : ''}`}
            onClick={action.onClick}
            disabled={action.disabled}
            onMouseEnter={() => handleActionMouseEnter(action.id)}
            onMouseLeave={handleActionMouseLeave}
            title={action.title}
          >
            <span className="quick-action-icon">{action.icon}</span>
            {action.badge && (
              <span className="quick-action-badge">{action.badge}</span>
            )}
          </button>
          
          {showTooltip === action.id && (
            <div className="quick-action-tooltip">
              {action.title}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
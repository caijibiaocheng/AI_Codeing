import React, { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

interface NotificationSystemProps {
  theme?: 'light' | 'dark';
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ theme = 'dark' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 添加通知
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? (notification.type === 'error' ? 0 : 5000)
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // 自动移除通知
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  }, []);

  // 移除通知
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // 清除所有通知
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 暴露方法到全局
  useEffect(() => {
    (window as any).notificationSystem = {
      info: (title: string, message?: string, options?: Partial<Notification>) =>
        addNotification({ type: 'info', title, message, ...options }),
      success: (title: string, message?: string, options?: Partial<Notification>) =>
        addNotification({ type: 'success', title, message, ...options }),
      warning: (title: string, message?: string, options?: Partial<Notification>) =>
        addNotification({ type: 'warning', title, message, ...options }),
      error: (title: string, message?: string, options?: Partial<Notification>) =>
        addNotification({ type: 'error', title, message, ...options }),
      clear: clearAllNotifications
    };
  }, [addNotification, clearAllNotifications]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': 
      default: return 'ℹ️';
    }
  };

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'notification-success';
      case 'warning': return 'notification-warning';
      case 'error': return 'notification-error';
      case 'info': 
      default: return 'notification-info';
    }
  };

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${getNotificationStyle(notification.type)}`}
        >
          <div className="notification-content">
            <div className="notification-header">
              <span className="notification-icon">
                {getNotificationIcon(notification.type)}
              </span>
              <span className="notification-title">
                {notification.title}
              </span>
              <button
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
                title="关闭"
              >
                ✕
              </button>
            </div>
            
            {notification.message && (
              <div className="notification-message">
                {notification.message}
              </div>
            )}
            
            {notification.actions && notification.actions.length > 0 && (
              <div className="notification-actions">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    className={`notification-action ${action.primary ? 'primary' : ''}`}
                    onClick={() => {
                      action.action();
                      removeNotification(notification.id);
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {notification.duration && notification.duration > 0 && (
            <div 
              className="notification-progress"
              style={{
                animationDuration: `${notification.duration}ms`
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
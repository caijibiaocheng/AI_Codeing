/**
 * 任务队列面板
 * 显示任务队列，支持任务编辑、置顶、删除等操作
 */
import React, { useState, useCallback, useRef } from 'react';
import { useTaskQueue, Task } from '../contexts/TaskQueueContext';
import './TaskQueuePanel.css';

const TaskQueuePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    tasks,
    isQueueEnabled,
    setQueueEnabled,
    currentExecutingTaskId,
    editTask,
    pinTask,
    deleteTask,
    clearCompletedTasks,
  } = useTaskQueue();

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleEditStart = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setTimeout(() => editInputRef.current?.focus(), 0);
  }, []);

  const handleEditSave = useCallback(() => {
    if (editingTaskId) {
      editTask(editingTaskId, editTitle, editDescription);
      setEditingTaskId(null);
    }
  }, [editingTaskId, editTitle, editDescription, editTask]);

  const handleEditCancel = useCallback(() => {
    setEditingTaskId(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  }, [handleEditSave, handleEditCancel]);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const executingCount = tasks.filter(t => t.status === 'executing').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;

  return (
    <div className="side-panel task-queue-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">📋</span>
          <span>任务队列</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="关闭">
          ✕
        </button>
      </div>

      {/* Queue Control */}
      <div className="task-queue-control">
        <div className="queue-toggle">
          <label>
            <input
              type="checkbox"
              checked={isQueueEnabled}
              onChange={(e) => setQueueEnabled(e.target.checked)}
            />
            <span>启用队列</span>
          </label>
        </div>
        
        <div className="queue-stats">
          <div className="stat-item">
            <span className="stat-label">待执行</span>
            <span className="stat-count">{pendingCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">执行中</span>
            <span className="stat-count executing">{executingCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">已完成</span>
            <span className="stat-count completed">{completedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">失败</span>
            <span className="stat-count failed">{failedCount}</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="task-empty">
            <div className="empty-icon">📭</div>
            <div className="empty-text">暂无任务</div>
          </div>
        ) : (
          <>
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item task-${task.status} ${
                  currentExecutingTaskId === task.id ? 'executing' : ''
                }`}
              >
                <div className="task-header">
                  <div className="task-status-indicator">
                    {task.status === 'pending' && '⏳'}
                    {task.status === 'executing' && '▶️'}
                    {task.status === 'completed' && '✅'}
                    {task.status === 'failed' && '❌'}
                  </div>
                  
                  {editingTaskId === task.id ? (
                    <div className="task-edit-form">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="任务标题"
                        className="task-edit-input"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="任务描述（可选）"
                        className="task-edit-textarea"
                        rows={2}
                      />
                      <div className="task-edit-actions">
                        <button
                          className="btn-save"
                          onClick={handleEditSave}
                          title="保存"
                        >
                          保存
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={handleEditCancel}
                          title="取消"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="task-content">
                        <div className="task-title">{task.title}</div>
                        {task.description && (
                          <div className="task-description">{task.description}</div>
                        )}
                        <div className="task-meta">
                          <span className="task-time">
                            {new Date(task.updatedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="task-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditStart(task)}
                          title="编辑"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-pin"
                          onClick={() => pinTask(task.id)}
                          title="置顶"
                        >
                          📌
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => deleteTask(task.id)}
                          title="删除"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Clear Completed */}
      {completedCount > 0 && (
        <div className="panel-footer">
          <button
            className="btn-clear-completed"
            onClick={clearCompletedTasks}
          >
            清除已完成任务 ({completedCount})
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="panel-help">
        <div className="help-item">
          <span className="help-icon">@</span>
          <span className="help-text">引入上下文</span>
        </div>
        <div className="help-item">
          <span className="help-icon">/</span>
          <span className="help-text">快速调用指令</span>
        </div>
      </div>
    </div>
  );
};

export default TaskQueuePanel;

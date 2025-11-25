import React, { useEffect, useState } from 'react';
import { t } from '../i18n';
import './TodoPanel.css';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  filePath?: string;
  line?: number;
  createdAt: number;
  updatedAt: number;
}

interface TodoPanelProps {
  rootPath: string | null;
  onClose: () => void;
  onFileOpen?: (filePath: string, line?: number) => void;
}

type TabType = 'my-todos' | 'scanned';
type FilterType = 'all' | 'active' | 'completed';

const TodoPanel: React.FC<TodoPanelProps> = ({ rootPath, onClose, onFileOpen }) => {
  const [activeTab, setActiveTab] = useState<TabType>('my-todos');
  const [myTodos, setMyTodos] = useState<TodoItem[]>([]);
  const [scannedTodos, setScannedTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadMyTodos();
  }, []);

  const loadMyTodos = async () => {
    try {
      const result = await window.electronAPI.pmGetTodos();
      if (result.success && result.data) {
        setMyTodos(result.data);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const scanWorkspaceTodos = async () => {
    if (!rootPath) return;

    setScanning(true);
    try {
      const result = await window.electronAPI.pmScanTodos(rootPath);
      if (result.success && result.data) {
        setScannedTodos(result.data);
        setActiveTab('scanned');
      }
    } catch (error) {
      console.error('Failed to scan todos:', error);
    } finally {
      setScanning(false);
    }
  };

  const addTodo = async () => {
    if (!newTodoText.trim()) return;

    try {
      const result = await window.electronAPI.pmAddTodo(newTodoText, newTodoPriority);
      if (result.success) {
        await loadMyTodos();
        setShowAddModal(false);
        setNewTodoText('');
        setNewTodoPriority('medium');
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await window.electronAPI.pmUpdateTodo(id, { completed: !completed });
      await loadMyTodos();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await window.electronAPI.pmDeleteTodo(id);
      await loadMyTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const filterTodos = (todos: TodoItem[]) => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  };

  const currentTodos = activeTab === 'my-todos' ? myTodos : scannedTodos;
  const filteredTodos = filterTodos(currentTodos);

  return (
    <div className="todo-panel">
      <div className="todo-header">
        <h3>{t('todo.title')}</h3>
        <div className="todo-actions">
          <button
            className="todo-btn"
            onClick={() => setShowAddModal(true)}
          >
            {t('todo.addTodo')}
          </button>
          {rootPath && (
            <button
              className="todo-btn"
              onClick={scanWorkspaceTodos}
              disabled={scanning}
            >
              {scanning ? t('todo.scanning') : t('todo.scanWorkspace')}
            </button>
          )}
          <button className="todo-btn" onClick={onClose}>{t('common.close')}</button>
        </div>
      </div>

      <div className="todo-tabs">
        <button
          className={`todo-tab ${activeTab === 'my-todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-todos')}
        >
          {t('todo.myTodos')} ({myTodos.length})
        </button>
        <button
          className={`todo-tab ${activeTab === 'scanned' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanned')}
        >
          {t('todo.scanned')} ({scannedTodos.length})
        </button>
      </div>

      <div className="todo-filter">
        <button
          className={`todo-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('todo.all')}
        </button>
        <button
          className={`todo-filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          {t('todo.active')}
        </button>
        <button
          className={`todo-filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          {t('todo.completed')}
        </button>
      </div>

      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <div className="todo-empty">
            {currentTodos.length === 0 
              ? t('todo.noTodosYet')
              : `${t('todo.noTodosYet')}`}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`}
            >
              <div className="todo-item-header">
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => activeTab === 'my-todos' && toggleTodo(todo.id, todo.completed)}
                  disabled={activeTab !== 'my-todos'}
                />
                <div className="todo-item-content">
                  <div className="todo-item-text">{todo.text}</div>
                  <div className="todo-item-meta">
                    <span className={`todo-item-priority ${todo.priority}`}>
                      {t(`todo.${todo.priority}`)}
                    </span>
                    {todo.filePath && (
                      <span
                        className="todo-item-location"
                        onClick={() => onFileOpen && onFileOpen(todo.filePath!, todo.line)}
                        style={{ cursor: onFileOpen ? 'pointer' : 'default', color: onFileOpen ? 'var(--accent-color)' : 'inherit' }}
                      >
                        📄 {todo.filePath.split(/[/\\]/).pop()}
                        {todo.line && `:${todo.line}`}
                      </span>
                    )}
                    {activeTab === 'my-todos' && (
                      <button
                        className="todo-item-delete"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="todo-add-modal" onClick={() => setShowAddModal(false)}>
          <div className="todo-add-content" onClick={(e) => e.stopPropagation()}>
            <h4>{t('todo.addTodo')}</h4>
            <div className="todo-input-group">
              <label>{t('todo.text')}</label>
              <textarea
                className="todo-textarea"
                placeholder={t('todo.text')}
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                autoFocus
              />
            </div>
            <div className="todo-input-group">
              <label>{t('todo.priority')}</label>
              <select
                className="todo-select"
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value as any)}
              >
                <option value="low">{t('todo.low')}</option>
                <option value="medium">{t('todo.medium')}</option>
                <option value="high">{t('todo.high')}</option>
              </select>
            </div>
            <div className="todo-add-actions">
              <button
                className="todo-btn"
                onClick={() => setShowAddModal(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="todo-btn"
                onClick={addTodo}
                disabled={!newTodoText.trim()}
              >
                {t('todo.add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoPanel;

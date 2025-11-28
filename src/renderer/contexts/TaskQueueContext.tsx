/**
 * 任务队列上下文
 * 管理任务队列的状态、执行、编辑和排序
 */
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
}

export interface TaskQueueContextValue {
  // Task Management
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  removeTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  editTask: (taskId: string, title: string, description?: string) => void;
  pinTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  clearCompletedTasks: () => void;

  // Queue State
  isQueueEnabled: boolean;
  setQueueEnabled: (enabled: boolean) => void;
  currentExecutingTaskId: string | null;
  
  // Execution Control
  startNextTask: () => void;
  completeCurrentTask: () => void;
  failCurrentTask: (error: string) => void;
  
  // Auto-toggle behavior
  autoDisableQueue: (reason: string) => void;
}

const TaskQueueContext = createContext<TaskQueueContextValue | undefined>(undefined);

const generateTaskId = (): string => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const TaskQueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isQueueEnabled, setQueueEnabledState] = useState<boolean>(true);
  const [currentExecutingTaskId, setCurrentExecutingTaskId] = useState<string | null>(null);
  const [lastAutoDisableReason, setLastAutoDisableReason] = useState<string>('');

  // Add a new task
  const addTask = useCallback((task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateTaskId(),
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setTasks(prev => [...prev, newTask]);
    
    if (isQueueEnabled && currentExecutingTaskId === null) {
      startNextTask();
    }
  }, [isQueueEnabled, currentExecutingTaskId]);

  // Remove task by id
  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (currentExecutingTaskId === taskId) {
      setCurrentExecutingTaskId(null);
    }
  }, [currentExecutingTaskId]);

  // Update task
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(t => 
        t.id === taskId 
          ? { ...t, ...updates, updatedAt: Date.now() }
          : t
      )
    );
  }, []);

  // Edit task (update title and description)
  const editTask = useCallback((taskId: string, title: string, description?: string) => {
    updateTask(taskId, { title, description });
  }, [updateTask]);

  // Pin task (move to top)
  const pinTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const taskToPin = prev.find(t => t.id === taskId);
      if (!taskToPin) return prev;
      
      const filtered = prev.filter(t => t.id !== taskId);
      return [taskToPin, ...filtered];
    });
  }, []);

  // Delete task
  const deleteTask = useCallback((taskId: string) => {
    removeTask(taskId);
  }, [removeTask]);

  // Clear completed tasks
  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(t => t.status !== 'completed'));
  }, []);

  // Start next pending task
  const startNextTask = useCallback(() => {
    if (!isQueueEnabled) return;
    
    const nextTask = tasks.find(t => t.status === 'pending');
    if (nextTask) {
      setCurrentExecutingTaskId(nextTask.id);
      updateTask(nextTask.id, { status: 'executing' });
    }
  }, [tasks, isQueueEnabled, updateTask]);

  // Complete current task and auto-start next
  const completeCurrentTask = useCallback(() => {
    if (currentExecutingTaskId) {
      updateTask(currentExecutingTaskId, { status: 'completed' });
      setCurrentExecutingTaskId(null);
      
      if (isQueueEnabled) {
        setTimeout(() => startNextTask(), 500);
      }
    }
  }, [currentExecutingTaskId, updateTask, isQueueEnabled, startNextTask]);

  // Fail current task
  const failCurrentTask = useCallback((error: string) => {
    if (currentExecutingTaskId) {
      updateTask(currentExecutingTaskId, { status: 'failed' });
      setCurrentExecutingTaskId(null);
    }
  }, [currentExecutingTaskId, updateTask]);

  // Auto-disable queue
  const autoDisableQueue = useCallback((reason: string) => {
    setQueueEnabledState(false);
    setLastAutoDisableReason(reason);
    setCurrentExecutingTaskId(null);
  }, []);

  // Manual toggle queue
  const setQueueEnabled = useCallback((enabled: boolean) => {
    setQueueEnabledState(enabled);
    
    if (enabled && currentExecutingTaskId === null) {
      setTimeout(() => startNextTask(), 100);
    } else if (!enabled) {
      setCurrentExecutingTaskId(null);
    }
  }, [currentExecutingTaskId, startNextTask]);

  const value: TaskQueueContextValue = {
    tasks,
    addTask,
    removeTask,
    updateTask,
    editTask,
    pinTask,
    deleteTask,
    clearCompletedTasks,
    isQueueEnabled,
    setQueueEnabled,
    currentExecutingTaskId,
    startNextTask,
    completeCurrentTask,
    failCurrentTask,
    autoDisableQueue,
  };

  return (
    <TaskQueueContext.Provider value={value}>
      {children}
    </TaskQueueContext.Provider>
  );
};

export const useTaskQueue = (): TaskQueueContextValue => {
  const context = useContext(TaskQueueContext);
  if (!context) {
    throw new Error('useTaskQueue must be used within a TaskQueueProvider');
  }
  return context;
};

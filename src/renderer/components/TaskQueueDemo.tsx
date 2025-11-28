/**
 * 任务队列演示组件
 * 展示如何使用 TaskQueue 系统
 * 
 * 这个组件是一个参考实现，展示了任务队列的各种用法
 */
import React, { useCallback, useState } from 'react';
import { useTaskQueue } from '../contexts/TaskQueueContext';

const TaskQueueDemo: React.FC = () => {
  const {
    tasks,
    isQueueEnabled,
    setQueueEnabled,
    currentExecutingTaskId,
    addTask,
    editTask,
    pinTask,
    deleteTask,
    clearCompletedTasks,
    completeCurrentTask,
    failCurrentTask,
    autoDisableQueue,
  } = useTaskQueue();

  const [inputTitle, setInputTitle] = useState('');
  const [inputDescription, setInputDescription] = useState('');

  // 添加新任务
  const handleAddTask = useCallback(() => {
    if (inputTitle.trim()) {
      addTask({
        title: inputTitle,
        description: inputDescription,
      });
      setInputTitle('');
      setInputDescription('');
    }
  }, [inputTitle, inputDescription, addTask]);

  // 完成当前任务
  const handleCompleteTask = useCallback(() => {
    completeCurrentTask();
  }, [completeCurrentTask]);

  // 当前任务失败
  const handleFailTask = useCallback(() => {
    failCurrentTask('演示错误');
  }, [failCurrentTask]);

  // 自动禁用队列演示
  const handleAutoDisable = useCallback(() => {
    autoDisableQueue('演示：自动禁用队列');
  }, [autoDisableQueue]);

  // 查找当前执行的任务
  const currentTask = tasks.find(t => t.id === currentExecutingTaskId);

  return (
    <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#d4d4d4' }}>
      <h2>📋 任务队列演示</h2>

      {/* 任务输入区 */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#252526', borderRadius: '4px' }}>
        <h3>添加新任务</h3>
        <input
          type="text"
          placeholder="任务标题"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          style={{
            display: 'block',
            marginBottom: '10px',
            width: '100%',
            padding: '8px',
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            border: '1px solid #3e3e42',
            borderRadius: '4px',
          }}
        />
        <textarea
          placeholder="任务描述（可选）"
          value={inputDescription}
          onChange={(e) => setInputDescription(e.target.value)}
          style={{
            display: 'block',
            marginBottom: '10px',
            width: '100%',
            padding: '8px',
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            border: '1px solid #3e3e42',
            borderRadius: '4px',
            minHeight: '60px',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleAddTask}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          添加任务
        </button>
      </div>

      {/* 队列控制区 */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#252526', borderRadius: '4px' }}>
        <h3>队列控制</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={isQueueEnabled}
              onChange={(e) => setQueueEnabled(e.target.checked)}
            />
            <span> 启用队列</span>
          </label>
        </div>
        <button
          onClick={handleCompleteTask}
          disabled={!currentTask}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: currentTask ? '#81c784' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentTask ? 'pointer' : 'not-allowed',
          }}
        >
          完成当前任务
        </button>
        <button
          onClick={handleFailTask}
          disabled={!currentTask}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: currentTask ? '#e57373' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentTask ? 'pointer' : 'not-allowed',
          }}
        >
          标记为失败
        </button>
        <button
          onClick={handleAutoDisable}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          自动禁用队列
        </button>
      </div>

      {/* 统计信息 */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#252526', borderRadius: '4px' }}>
        <h3>队列统计</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4fc3f7' }}>
              {tasks.filter(t => t.status === 'pending').length}
            </div>
            <div style={{ fontSize: '12px', color: '#858585' }}>待执行</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd54f' }}>
              {tasks.filter(t => t.status === 'executing').length}
            </div>
            <div style={{ fontSize: '12px', color: '#858585' }}>执行中</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#81c784' }}>
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <div style={{ fontSize: '12px', color: '#858585' }}>已完成</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e57373' }}>
              {tasks.filter(t => t.status === 'failed').length}
            </div>
            <div style={{ fontSize: '12px', color: '#858585' }}>失败</div>
          </div>
        </div>
      </div>

      {/* 当前执行任务 */}
      {currentTask && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#1e4620', borderRadius: '4px' }}>
          <h3>正在执行</h3>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>▶️ {currentTask.title}</div>
          {currentTask.description && (
            <div style={{ fontSize: '12px', color: '#858585', marginTop: '5px' }}>
              {currentTask.description}
            </div>
          )}
        </div>
      )}

      {/* 任务列表 */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#252526', borderRadius: '4px' }}>
        <h3>所有任务 ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <div style={{ color: '#858585' }}>暂无任务</div>
        ) : (
          <div>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  backgroundColor: '#1e1e1e',
                  borderLeft: `3px solid ${
                    task.status === 'pending' ? '#4fc3f7' :
                    task.status === 'executing' ? '#ffd54f' :
                    task.status === 'completed' ? '#81c784' : '#e57373'
                  }`,
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {task.status === 'pending' && '⏳'}
                      {task.status === 'executing' && '▶️'}
                      {task.status === 'completed' && '✅'}
                      {task.status === 'failed' && '❌'}
                      {' '} {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '12px', color: '#858585', marginTop: '5px' }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#6a6a6a', marginTop: '5px' }}>
                      {new Date(task.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                    <button
                      onClick={() => pinTask(task.id)}
                      title="置顶"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#333',
                        color: '#d4d4d4',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      📌
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      title="删除"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#333',
                        color: '#d4d4d4',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tasks.some(t => t.status === 'completed') && (
          <button
            onClick={clearCompletedTasks}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#555',
              color: '#d4d4d4',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            清除已完成任务
          </button>
        )}
      </div>

      {/* 使用说明 */}
      <div style={{ padding: '10px', backgroundColor: '#252526', borderRadius: '4px', fontSize: '12px' }}>
        <h3>使用说明</h3>
        <ul>
          <li>1. 在上方输入框中输入任务标题和描述，然后点击"添加任务"</li>
          <li>2. 启用队列后，系统会自动执行队列中的任务</li>
          <li>3. 点击"完成当前任务"按钮完成当前任务，自动开始下一个</li>
          <li>4. 点击"📌"可以将任务置顶</li>
          <li>5. 点击"🗑️"可以删除任务</li>
          <li>6. 查看 TaskQueuePanel 组件获取完整的 UI 界面</li>
        </ul>
      </div>
    </div>
  );
};

export default TaskQueueDemo;

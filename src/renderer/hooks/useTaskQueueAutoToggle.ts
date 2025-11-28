/**
 * Task Queue Auto-Toggle Hook
 * 管理任务队列的自动开关逻辑
 */
import { useEffect, useCallback } from 'react';
import { useTaskQueue } from '../contexts/TaskQueueContext';
import { usePanels } from '../contexts/AppContext';

export const useTaskQueueAutoToggle = () => {
  const { isQueueEnabled, setQueueEnabled, autoDisableQueue } = useTaskQueue();
  const { panels } = usePanels();

  // 当新开启聊天会话时，自动关闭任务队列
  useEffect(() => {
    // 检测到新的聊天会话时禁用队列
    if (panels.isChatOpen) {
      // 这里可以添加逻辑来检测新会话
      // 暂时注释，以避免每次打开聊天时都禁用队列
      // autoDisableQueue('新开启聊天会话');
    }
  }, [panels.isChatOpen, autoDisableQueue]);

  // 处理 JoyCode 问题确认时的自动禁用
  const handleJoyCodeIssueConfirmNeeded = useCallback(() => {
    autoDisableQueue('JoyCode需要确认问题');
  }, [autoDisableQueue]);

  return {
    isQueueEnabled,
    setQueueEnabled,
    autoDisableQueue,
    handleJoyCodeIssueConfirmNeeded,
  };
};

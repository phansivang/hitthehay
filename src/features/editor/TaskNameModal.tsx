import React, { useState, useEffect, useRef } from 'react';

interface TaskNameModalProps {
  onSave: (taskName: string) => Promise<void>;
  isOpen: boolean;
}

const TaskNameModal: React.FC<TaskNameModalProps> = ({ onSave, isOpen }) => {
  const [taskName, setTaskName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(taskName.trim());
      setTaskName('');
    } catch (error) {
      console.error('Error saving task name:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="w-full max-w-lg mx-4">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter task name..."
            disabled={isLoading}
            className="w-full px-4 py-3 text-xl bg-transparent border-0 border-b-2 border-b-gray-300 focus:outline-none focus:border-b-[#f65e05] text-gray-900 placeholder-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition-colors"
          />
          {isLoading && (
            <div className="mt-3 flex justify-center">
              <div className="w-5 h-5 border-2 border-[#f65e05] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TaskNameModal;


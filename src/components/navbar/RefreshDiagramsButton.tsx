import React, { useState } from 'react';

interface RefreshDiagramsButtonProps {
  onRefresh: (() => void) | null;
}

const RefreshDiagramsButton: React.FC<RefreshDiagramsButtonProps> = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      // Keep the spinning animation for at least 500ms for visual feedback
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!onRefresh || isRefreshing}
      className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Refresh Diagrams"
      aria-label="Refresh diagrams from Kroki"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </button>
  );
};

export default RefreshDiagramsButton;


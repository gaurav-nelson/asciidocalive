import React from 'react';
import { Link, Unlink } from 'lucide-react';

interface SyncScrollToggleProps {
  isSyncScrollEnabled: boolean;
  onToggle: () => void;
}

const SyncScrollToggle: React.FC<SyncScrollToggleProps> = ({ isSyncScrollEnabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
      title={isSyncScrollEnabled ? 'Disable sync scroll' : 'Enable sync scroll'}
    >
      {isSyncScrollEnabled ? (
        <Link className="h-4 w-4" />
      ) : (
        <Unlink className="h-4 w-4" />
      )}
    </button>
  );
};

export default SyncScrollToggle;


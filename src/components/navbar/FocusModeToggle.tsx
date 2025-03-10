import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FocusModeToggleProps {
  isFocusMode: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

const FocusModeToggle: React.FC<FocusModeToggleProps> = ({ isFocusMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
      title={isFocusMode ? 'Disable focus mode' : 'Enable focus mode'}
    >
      {isFocusMode ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  );
};

export default FocusModeToggle;

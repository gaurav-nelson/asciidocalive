import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImportDropdownProps {
  isOpen: boolean;
  toggleDropdown: () => void;
  onImportClick: (source: 'file' | 'GitHub' | 'GitLab') => void;
}

const ImportDropdown: React.FC<ImportDropdownProps> = ({
  isOpen,
  toggleDropdown,
  onImportClick,
}) => {
  return (
    <div className="relative">
      <button
        className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
        onClick={toggleDropdown}
      >
        <Upload className="h-4 w-4" />
        <span>Import</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10">
          <button
            className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => onImportClick('file')}
          >
            Local file
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => onImportClick('GitHub')}
          >
            From GitHub
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => onImportClick('GitLab')}
          >
            From GitLab
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportDropdown;

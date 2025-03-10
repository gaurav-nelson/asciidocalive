import React from 'react';
import { Download } from 'lucide-react';

interface ExportDropdownProps {
  isOpen: boolean;
  toggleDropdown: () => void;
  onExportClick: (format: 'PDF' | 'AsciiDoc' | 'HTML') => void;
  isExporting: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  isOpen,
  toggleDropdown,
  onExportClick,
  isExporting,
}) => {
  return (
    <div className="relative">
      <button
        className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
        onClick={toggleDropdown}
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10">
          <button
            className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => onExportClick('PDF')}
            disabled={isExporting}
          >
            PDF
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => onExportClick('HTML')}
            disabled={isExporting}
          >
            HTML
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => onExportClick('AsciiDoc')}
            disabled={isExporting}
          >
            AsciiDoc
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;

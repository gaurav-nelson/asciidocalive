import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Upload, Github } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { exportToPDF } from '../utils/pdfExport';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onFileLoad: (content: string) => void;
  getEditorContent: (() => string) | null;
}

const Navbar: React.FC<NavbarProps> = ({
  isDark,
  onToggleTheme,
  onFileLoad,
  getEditorContent
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.adoc,.asciidoc,.asc';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileLoad(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const onExportClick = async (format: string) => {
    if (!getEditorContent) return;

    setIsExporting(true);

    try {
      if (format === 'PDF') {
        await exportToPDF();
      } else if (format === 'AsciiDoc') {
        const content = getEditorContent();
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'document.adoc';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-slate-800 dark:bg-slate-900 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span className="text-xl font-bold">AsciiDoc Alive</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-slate-700 transition-colors"
            onClick={onImportClick}
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-slate-700 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
            {isDropdownOpen && (
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
                  onClick={() => onExportClick('AsciiDoc')}
                  disabled={isExporting}
                >
                  AsciiDoc
                </button>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-600"></div>

          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

          <div className="h-6 w-px bg-slate-600"></div>

          <a
            href="https://github.com/gaurav-nelson/asciidocalive"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-slate-700 transition-colors"
            title="View on GitHub"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
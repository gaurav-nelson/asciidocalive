import React, { useState, useEffect, useRef, useCallback, RefObject } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './navbar/ThemeToggle';
import Modal from './Modal';
import ImportDropdown from './navbar/ImportDropdown';
import ExportDropdown from './navbar/ExportDropdown';
import HelpDropdown from './navbar/HelpDropdown';
import FocusModeToggle from './navbar/FocusModeToggle';
import SyncScrollToggle from './navbar/SyncScrollToggle';
import RefreshDiagramsButton from './navbar/RefreshDiagramsButton';
import Divider from './navbar/Divider';
import useClickOutside from '../hooks/useClickOutside';
import { exportToAsciiDoc, exportToPDF, exportToHTML } from '../utils/exportUtils';
import packageJson from '../../package.json';

const favicon32 = new URL('../assets/favicon-32x32.png', import.meta.url).href;

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onFileLoad: (content: string) => void;
  getEditorContent: (() => string) | null;
  syncScrollEnabled: boolean;
  onToggleSyncScroll: () => void;
  onRefreshDiagrams: (() => void) | null;
  onShowWhatsNew: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isDark,
  onToggleTheme,
  onFileLoad,
  getEditorContent,
  syncScrollEnabled,
  onToggleSyncScroll,
  onRefreshDiagrams,
  onShowWhatsNew,
}) => {
  // Dropdown states
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);

  // Other states
  const [isExporting, setIsExporting] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [importSource, setImportSource] = useState<'GitHub' | 'GitLab' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs
  const importDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const helpDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close all dropdowns when clicking outside
  useClickOutside(
    [importDropdownRef as RefObject<HTMLElement>, exportDropdownRef as RefObject<HTMLElement>, helpDropdownRef as RefObject<HTMLElement>],
    useCallback(() => {
      setIsImportDropdownOpen(false);
      setIsExportDropdownOpen(false);
      setIsHelpDropdownOpen(false);
    }, [])
  );

  // Toggle functions
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  const toggleImportDropdown = () => {
    setIsExportDropdownOpen(false);
    setIsHelpDropdownOpen(false);
    setIsImportDropdownOpen(prev => !prev);
  };

  const toggleExportDropdown = () => {
    setIsImportDropdownOpen(false);
    setIsHelpDropdownOpen(false);
    setIsExportDropdownOpen(prev => !prev);
  };

  const toggleHelpDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImportDropdownOpen(false);
    setIsExportDropdownOpen(false);
    setIsHelpDropdownOpen(prev => !prev);
  };

  const toggleFocusMode = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFocusMode(prev => !prev);
  }, []);

  // Handle import from various sources
  const onImportClick = (source: 'file' | 'GitHub' | 'GitLab') => {
    if (source === 'file') {
      fileInputRef.current?.click();
    } else {
      setImportSource(source as 'GitHub' | 'GitLab');
      setIsModalOpen(true);
    }
  };

  const handleImportFromUrl = async () => {
    if (!url) {
      alert('Please enter a valid URL');
      return;
    }

    try {
      let fetchUrl = url;

      // Handle GitHub raw content URLs
      if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        fetchUrl = url
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/');
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const content = await response.text();
      onFileLoad(content);
      setIsModalOpen(false);
      setUrl('');
      setIsImportDropdownOpen(false);
    } catch (error) {
      console.error('Error fetching file:', error);
      alert('Failed to fetch file. Please check the URL and try again.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoad(content);
        setIsImportDropdownOpen(false);
      };
      reader.onerror = () => {
        alert('Error reading file');
      };
      reader.readAsText(file);
    }
  };

  // Handle exports
  const onExportClick = async (format: 'PDF' | 'AsciiDoc' | 'HTML') => {
    if (!getEditorContent) return;

    setIsExporting(true);
    try {
      switch (format) {
        case 'PDF':
          await exportToPDF();
          break;
        case 'AsciiDoc':
          exportToAsciiDoc(getEditorContent);
          break;
        case 'HTML':
          await exportToHTML(getEditorContent);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export to ${format}. Please try again.`);
    } finally {
      setIsExporting(false);
      setIsExportDropdownOpen(false);
    }
  };

  // Focus mode effect
  useEffect(() => {
    const editorElement = document.querySelector('.asciidocalive-editor');
    const previewElement = document.querySelector('.asciidocalive-preview');

    if (editorElement && previewElement) {
      if (isFocusMode) {
        editorElement.classList.add('col-span-2', 'transition-transform', 'duration-500', 'ease-in-out');
        previewElement.classList.add('hidden', 'transition-opacity', 'duration-500', 'ease-in-out');
      } else {
        editorElement.classList.remove('col-span-2', 'transition-transform', 'duration-500', 'ease-in-out');
        previewElement.classList.remove('hidden', 'transition-opacity', 'duration-500', 'ease-in-out');
      }
    }
  }, [isFocusMode, isDark]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <nav className="bg-slate-900 dark:bg-slate-900 text-white p-4">
      <div className="noselect mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={favicon32} alt="Logo" className="h-6 w-6" />
          <span className="text-xl font-bold">AsciiDoc Alive</span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30">
            v{packageJson.version}
          </span>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden flex items-center px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Navigation items */}
        <div className={`md:flex items-center space-x-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".adoc,.asciidoc,.asc"
            onChange={handleFileUpload}
          />

          {/* Import dropdown */}
          <div ref={importDropdownRef}>
            <ImportDropdown
              isOpen={isImportDropdownOpen}
              toggleDropdown={toggleImportDropdown}
              onImportClick={onImportClick}
            />
          </div>

          {/* Export dropdown */}
          <div ref={exportDropdownRef}>
            <ExportDropdown
              isOpen={isExportDropdownOpen}
              toggleDropdown={toggleExportDropdown}
              onExportClick={onExportClick}
              isExporting={isExporting}
            />
          </div>

          <Divider />

          {/* Theme toggle */}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

          {/* Focus mode toggle */}
          <FocusModeToggle isFocusMode={isFocusMode} onToggle={toggleFocusMode} />

          {/* Sync scroll toggle */}
          <SyncScrollToggle isSyncScrollEnabled={syncScrollEnabled} onToggle={onToggleSyncScroll} />

          {/* Refresh diagrams button */}
          <RefreshDiagramsButton onRefresh={onRefreshDiagrams} />

          <Divider />

          {/* Help dropdown */}
          <div ref={helpDropdownRef}>
            <HelpDropdown
              isOpen={isHelpDropdownOpen}
              toggleDropdown={toggleHelpDropdown}
              onShowWhatsNew={onShowWhatsNew}
            />
          </div>
        </div>
      </div>

      {/* Import modal */}
      {isModalOpen && (
        <Modal
          title={`Import from ${importSource}`}
          onClose={() => {
            setIsModalOpen(false);
            setUrl('');
          }}
          onConfirm={handleImportFromUrl}
        >
          <div className="space-y-4">
            <input
              id="giturl"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={`Enter ${importSource} raw file URL`}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-sm dark:bg-slate-700 dark:text-white"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {importSource === 'GitHub'
                ? "Tip: Use the raw file URL or paste the regular GitHub file URL"
                : "Tip: Use the raw file URL from your GitLab repository"}
            </p>
          </div>
        </Modal>
      )}
    </nav>
  );
};

export default Navbar;

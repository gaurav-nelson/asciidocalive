import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Github, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Modal from './Modal';

const favicon32 = new URL('../assets/favicon-32x32.png', import.meta.url).href;
const docsWriterLogo = new URL('../assets/docswriter.png.webp', import.meta.url).href;

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
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const importDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [importSource, setImportSource] = useState<'GitHub' | 'GitLab' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

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

  const exportToPDF = async () => {
    if (!getEditorContent) return;

    try {
      // Get the HTML content from the preview div
      const previewElement = document.getElementById('editor-content');
      if (!previewElement) throw new Error('Preview element not found');

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) throw new Error('Failed to open print window');

      const modernStyles = `
      body {
        max-width: 48rem !important;
        margin: 0 auto !important;
        padding: 2rem !important;
      }
    `;

    //get the styles from https://github.com/asciidoctor/asciidoctor/blob/main/src/stylesheets/asciidoctor.css
    const styles = await fetch('https://raw.githubusercontent.com/asciidoctor/asciidoctor/main/src/stylesheets/asciidoctor.css').then(response => response.text());


      // Set up the print window content
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>${styles}</style>
            <style>${modernStyles}</style>
          </head>
          <body>
            <div class="content">
              ${previewElement.innerHTML}
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export to PDF. Please try again.');
    }
  };

  const exportToAsciiDoc = () => {
    if (!getEditorContent) return;

    try {
      const content = getEditorContent();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.adoc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExportDropdownOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export AsciiDoc. Please try again.');
    }
  };

  const exportToHTML = async () => {
    if (!getEditorContent) return;
    try {
      const previewElement = document.getElementById('editor-content');
      if (!previewElement) throw new Error('Preview element not found');

      const modernStyles = `
        body {
          max-width: 48rem !important;
          margin: 0 auto !important;
          padding: 2rem !important;
        }
      `;

      //get the styles from https://github.com/asciidoctor/asciidoctor/blob/main/src/stylesheets/asciidoctor.css
      const styles = await fetch('https://raw.githubusercontent.com/asciidoctor/asciidoctor/main/src/stylesheets/asciidoctor.css').then(response => response.text());

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>${styles}</style>
            <style>${modernStyles}</style>
          </head>
          <body>
            ${previewElement.innerHTML}
          </body>
        </html>
      `;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExportDropdownOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export HTML. Please try again.');
    }
  }

  const toggleImportDropdown = () => {
    setIsExportDropdownOpen(false); // Close export dropdown if open
    setIsImportDropdownOpen((prev) => !prev); // Toggle import dropdown
  };

  const toggleExportDropdown = () => {
    setIsImportDropdownOpen(false); // Close import dropdown if open
    setIsExportDropdownOpen((prev) => !prev); // Toggle export dropdown
  };

  const onImportClick = (source: 'file' | 'GitHub' | 'GitLab') => {
    if (source === 'file') {
      fileInputRef.current?.click();
    } else {
      setImportSource(source);
      setIsModalOpen(true);
    }
  };

  const onExportClick = async (format: 'PDF' | 'AsciiDoc' | 'HTML') => {
    if (!getEditorContent) return;

    setIsExporting(true);
    try {
      switch (format) {
        case 'PDF':
          await exportToPDF();
          break;
        case 'AsciiDoc':
          exportToAsciiDoc();
          break;
        case 'HTML':
          exportToHTML();
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        importDropdownRef.current &&
        !importDropdownRef.current.contains(event.target as Node) &&
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setIsImportDropdownOpen(false);
        setIsExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-slate-900 dark:bg-slate-900 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={favicon32} alt="Logo" className="h-6 w-6" />
          <span className="text-xl font-bold">AsciiDoc Alive</span>
        </div>
        <button
          className="md:hidden flex items-center px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className={`md:flex items-center space-x-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".adoc,.asciidoc,.asc"
            onChange={handleFileUpload}
          />

          <div className="relative" ref={importDropdownRef}>
            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
              onClick={toggleImportDropdown}
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            {isImportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => onImportClick('file')}
                >
                  Upload a file
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

          <div className="relative" ref={exportDropdownRef}>
            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
              onClick={toggleExportDropdown}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
            {isExportDropdownOpen && (
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

          <div className="hidden md:block h-6 w-px bg-slate-600"></div>
          <div className="block md:hidden h-px w-full bg-slate-600 my-2"></div>

          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

          <div className="hidden md:block h-6 w-px bg-slate-600"></div>
          <div className="block md:hidden h-px w-full bg-slate-600 my-2"></div>

          <a
            href="https://github.com/gaurav-nelson/asciidocalive"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
            title="View on GitHub"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>

          <div className="hidden md:block h-6 w-px bg-slate-600"></div>
          <div className="block md:hidden h-px w-full bg-slate-600 my-2"></div>

          <a
            href="https://www.docswriter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
            title="Visit DocsWriter"
          >
            <img src={docsWriterLogo} alt="DocsWriter Logo" className="h-4 w-8" />
            <span>DocsWriter</span>
          </a>
        </div>
      </div>

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
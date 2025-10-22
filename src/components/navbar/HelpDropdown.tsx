import React from 'react';
import { Github, HelpCircle, Sparkles } from 'lucide-react';

interface HelpDropdownProps {
  isOpen: boolean;
  toggleDropdown: (e: React.MouseEvent) => void;
  onShowWhatsNew: () => void;
}

const docsWriterLogo = new URL('../../assets/docswriter.png.webp', import.meta.url).href;

const HelpDropdown: React.FC<HelpDropdownProps> = ({ isOpen, toggleDropdown, onShowWhatsNew }) => {
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
        title="About"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-sm shadow-lg z-10 py-1">
          {/* What's New */}
          <button
            onClick={() => {
              onShowWhatsNew();
              toggleDropdown({} as React.MouseEvent);
            }}
            className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="What's New"
          >
            <Sparkles className="h-4 w-4" />
            <span>What's New</span>
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/gaurav-nelson/asciidocalive"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="View on GitHub"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>

          {/* DocsWriter link */}
          <a
            href="https://www.docswriter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Visit DocsWriter"
          >
            <img src={docsWriterLogo} alt="DocsWriter Logo" className="h-4 w-8" />
            <span>DocsWriter</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default HelpDropdown;

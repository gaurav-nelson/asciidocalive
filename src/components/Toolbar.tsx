import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Code,
  Heading,
  Link,
  Image,
  List,
  ListOrdered,
  SquareCode,
  Table,
  AlertTriangle,
  Minus,
  ChevronDown,
} from 'lucide-react';

export type ToolbarAction =
  | { type: 'wrap'; before: string; after: string }
  | { type: 'linePrefix'; prefix: string }
  | { type: 'insert'; text: string }
  | { type: 'wrapBlock'; before: string; after: string };

interface ToolbarProps {
  isDark: boolean;
  onAction: (action: ToolbarAction) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ isDark, onAction }) => {
  const [headingOpen, setHeadingOpen] = useState(false);
  const [admonitionOpen, setAdmonitionOpen] = useState(false);

  const btnClass =
    'p-1.5 rounded hover:bg-slate-600 dark:hover:bg-slate-600 hover:bg-slate-200 transition-colors text-slate-300 dark:text-slate-300 text-slate-700';

  return (
    <div
      className={`flex items-center gap-1 px-3 py-1 border-b ${
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-slate-100 border-slate-200'
      }`}
      style={{ height: '36px' }}
    >
      {/* Bold */}
      <button
        className={btnClass}
        onClick={() => onAction({ type: 'wrap', before: '*', after: '*' })}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </button>

      {/* Italic */}
      <button
        className={btnClass}
        onClick={() => onAction({ type: 'wrap', before: '_', after: '_' })}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </button>

      {/* Monospace */}
      <button
        className={btnClass}
        onClick={() => onAction({ type: 'wrap', before: '`', after: '`' })}
        title="Monospace (Ctrl+`)"
      >
        <Code className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-slate-600 mx-1" />

      {/* Heading dropdown */}
      <div className="relative">
        <button
          className={`${btnClass} flex items-center gap-0.5`}
          onClick={() => { setHeadingOpen(!headingOpen); setAdmonitionOpen(false); }}
          title="Heading"
        >
          <Heading className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </button>
        {headingOpen && (
          <div className="absolute left-0 top-8 w-24 bg-slate-700 border border-slate-600 rounded shadow-lg z-20">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                className="block w-full text-left px-3 py-1 text-sm text-slate-300 hover:bg-slate-600"
                onClick={() => {
                  onAction({ type: 'linePrefix', prefix: '='.repeat(level) + ' ' });
                  setHeadingOpen(false);
                }}
              >
                H{level}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Link */}
      <button
        className={btnClass}
        onClick={() =>
          onAction({ type: 'insert', text: 'https://url[link text]' })
        }
        title="Link (Ctrl+K)"
      >
        <Link className="h-4 w-4" />
      </button>

      {/* Image */}
      <button
        className={btnClass}
        onClick={() =>
          onAction({ type: 'insert', text: 'image::url[alt text]' })
        }
        title="Image"
      >
        <Image className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-slate-600 mx-1" />

      {/* Unordered List */}
      <button
        className={btnClass}
        onClick={() => onAction({ type: 'linePrefix', prefix: '* ' })}
        title="Unordered List"
      >
        <List className="h-4 w-4" />
      </button>

      {/* Ordered List */}
      <button
        className={btnClass}
        onClick={() => onAction({ type: 'linePrefix', prefix: '. ' })}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>

      {/* Source Block */}
      <button
        className={btnClass}
        onClick={() =>
          onAction({
            type: 'wrapBlock',
            before: '[source]\n----\n',
            after: '\n----',
          })
        }
        title="Source Block"
      >
        <SquareCode className="h-4 w-4" />
      </button>

      {/* Table */}
      <button
        className={btnClass}
        onClick={() =>
          onAction({
            type: 'insert',
            text: '|===\n| Header 1 | Header 2\n\n| Cell 1 | Cell 2\n| Cell 3 | Cell 4\n|===',
          })
        }
        title="Table"
      >
        <Table className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-slate-600 mx-1" />

      {/* Admonition dropdown */}
      <div className="relative">
        <button
          className={`${btnClass} flex items-center gap-0.5`}
          onClick={() => { setAdmonitionOpen(!admonitionOpen); setHeadingOpen(false); }}
          title="Admonition"
        >
          <AlertTriangle className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </button>
        {admonitionOpen && (
          <div className="absolute left-0 top-8 w-32 bg-slate-700 border border-slate-600 rounded shadow-lg z-20">
            {['NOTE', 'TIP', 'WARNING', 'IMPORTANT', 'CAUTION'].map((type) => (
              <button
                key={type}
                className="block w-full text-left px-3 py-1 text-sm text-slate-300 hover:bg-slate-600"
                onClick={() => {
                  onAction({
                    type: 'wrapBlock',
                    before: `[${type}]\n====\n`,
                    after: '\n====',
                  });
                  setAdmonitionOpen(false);
                }}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horizontal Rule */}
      <button
        className={btnClass}
        onClick={() => onAction({ type: 'insert', text: "\n'''\n" })}
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toolbar;

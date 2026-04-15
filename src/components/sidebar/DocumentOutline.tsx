import React from 'react';

export interface OutlineHeading {
  level: number;
  text: string;
  id: string;
}

interface DocumentOutlineProps {
  headings: OutlineHeading[];
  activeHeadingId: string | null;
  onHeadingClick: (heading: OutlineHeading) => void;
}

const DocumentOutline: React.FC<DocumentOutlineProps> = ({
  headings,
  activeHeadingId,
  onHeadingClick,
}) => {
  return (
    <div className="flex flex-col">
      <div className="px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Outline
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {headings.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-500 italic">No headings found</p>
        ) : (
          headings.map((h, i) => (
            <button
              key={`${h.id}-${i}`}
              className={`block w-full text-left px-3 py-1 text-sm truncate transition-colors ${
                activeHeadingId === h.id
                  ? 'text-blue-300 bg-blue-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              style={{ paddingLeft: `${(h.level - 1) * 12 + 12}px` }}
              onClick={() => onHeadingClick(h)}
              title={h.text}
            >
              {h.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentOutline;

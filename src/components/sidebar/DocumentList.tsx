import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Document } from '../../utils/indexedDBService';

interface DocumentListProps {
  documents: Document[];
  activeDocumentId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  activeDocumentId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const startRename = (doc: Document) => {
    setRenamingId(doc.id);
    setRenameValue(doc.name);
    setMenuOpenId(null);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Documents
        </span>
        <button
          onClick={onCreate}
          className="p-1 rounded hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
          title="New document"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`group flex items-center px-3 py-1.5 cursor-pointer text-sm ${
              doc.id === activeDocumentId
                ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-400'
                : 'text-slate-300 hover:bg-slate-700/50 border-l-2 border-transparent'
            }`}
            onClick={() => {
              if (renamingId !== doc.id) onSelect(doc.id);
            }}
          >
            {renamingId === doc.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                className="flex-1 bg-slate-700 text-white text-sm px-1 py-0.5 rounded border border-slate-500 outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="flex-1 truncate">{doc.name}</span>
                <div className="flex items-center gap-0.5">
                  <button
                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-600 transition-opacity"
                    title="Rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(doc);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-600 text-red-400 transition-opacity"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;

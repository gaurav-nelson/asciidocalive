import React from 'react';
import DocumentList from './sidebar/DocumentList';
import DocumentOutline, { OutlineHeading } from './sidebar/DocumentOutline';
import type { Document } from '../utils/indexedDBService';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  documents: Document[];
  activeDocumentId: string | null;
  headings: OutlineHeading[];
  activeHeadingId: string | null;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
  onRenameDocument: (id: string, name: string) => void;
  onDeleteDocument: (id: string) => void;
  onHeadingClick: (heading: OutlineHeading) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  documents,
  activeDocumentId,
  headings,
  activeHeadingId,
  onSelectDocument,
  onCreateDocument,
  onRenameDocument,
  onDeleteDocument,
  onHeadingClick,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className="fixed inset-0 bg-black/40 z-30 md:hidden"
        onClick={onClose}
      />
      <aside className="w-60 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden
        fixed md:relative inset-y-0 left-0 z-40 mt-[64px] md:mt-0 md:flex-shrink-0">
      {/* Documents section — 40% */}
      <div className="flex-[2] overflow-y-auto border-b border-slate-700">
        <DocumentList
          documents={documents}
          activeDocumentId={activeDocumentId}
          onSelect={onSelectDocument}
          onCreate={onCreateDocument}
          onRename={onRenameDocument}
          onDelete={onDeleteDocument}
        />
      </div>

      {/* Outline section — 60% */}
      <div className="flex-[3] overflow-y-auto">
        <DocumentOutline
          headings={headings}
          activeHeadingId={activeHeadingId}
          onHeadingClick={onHeadingClick}
        />
      </div>
    </aside>
    </>
  );
};

export default Sidebar;

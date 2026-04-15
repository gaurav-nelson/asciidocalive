import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { encodeDocumentToUrl } from '../../utils/shareUtils';

interface ShareButtonProps {
  getEditorContent: (() => string) | null;
}

const ShareButton: React.FC<ShareButtonProps> = ({ getEditorContent }) => {
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleShare = async () => {
    if (!getEditorContent) return;

    setStatus('copying');
    try {
      const content = getEditorContent();
      const url = await encodeDocumentToUrl(content);
      await navigator.clipboard.writeText(url);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to share');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="relative">
      <button
        className="cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-sm hover:bg-slate-700 transition-colors"
        onClick={handleShare}
        title="Share via URL"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden md:inline">{status === 'copied' ? 'Copied!' : 'Share'}</span>
      </button>
      {status === 'error' && (
        <div className="absolute right-0 mt-2 w-64 p-3 bg-red-900 text-red-100 border border-red-700 rounded-md shadow-lg z-10 text-sm">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default ShareButton;

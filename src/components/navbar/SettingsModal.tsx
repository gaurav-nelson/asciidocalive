import React, { useState, useEffect } from 'react';
import { indexedDBService } from '../../utils/indexedDBService';
import { verifyToken } from '../../utils/gistUtils';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [token, setToken] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const saved = await indexedDBService.getSetting<string>('githubToken');
      if (saved) setToken(saved);
    };
    load();
  }, []);

  const handleTest = async () => {
    if (!token.trim()) return;
    setTestStatus('testing');
    try {
      const login = await verifyToken(token.trim());
      setTestStatus('success');
      setTestMessage(`Authenticated as ${login}`);
    } catch {
      setTestStatus('error');
      setTestMessage('Invalid token');
    }
  };

  const handleSave = async () => {
    await indexedDBService.setSetting('githubToken', token.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-sm shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Settings</h2>

        <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-200">
          GitHub Personal Access Token
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          Required for saving to GitHub Gist. Needs only the <code>gist</code> scope.
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => { setToken(e.target.value); setTestStatus('idle'); }}
          placeholder="ghp_..."
          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-2"
        />

        {testStatus !== 'idle' && (
          <p className={`text-sm mb-2 ${testStatus === 'success' ? 'text-green-500' : testStatus === 'error' ? 'text-red-500' : 'text-slate-400'}`}>
            {testStatus === 'testing' ? 'Testing...' : testMessage}
          </p>
        )}

        <button
          onClick={handleTest}
          disabled={!token.trim() || testStatus === 'testing'}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 block"
        >
          Test connection
        </button>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-sm hover:bg-gray-400 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

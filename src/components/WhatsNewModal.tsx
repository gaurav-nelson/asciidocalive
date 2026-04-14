import React from 'react';
import { Database, ScrollText, Network, Calculator, Sparkles, Star, ArrowRight } from 'lucide-react';

interface WhatsNewModalProps {
  version: string;
  onClose: () => void;
  isDark: boolean;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ version, onClose, isDark }) => {
  const features: Feature[] = [
    {
      icon: <Database className="w-6 h-6 text-blue-500" />,
      title: 'IndexedDB & Caching',
      description: 'Migrated from localStorage with intelligent Kroki diagram caching',
    },
    {
      icon: <ScrollText className="w-6 h-6 text-green-500" />,
      title: 'Synchronized Scrolling',
      description: 'Editor and preview now scroll together seamlessly for better navigation',
    },
    {
      icon: <Network className="w-6 h-6 text-orange-500" />,
      title: 'Kroki Diagrams',
      description: 'Built-in support for various diagram types including PlantUML, Mermaid, and more',
    },
    {
      icon: <Calculator className="w-6 h-6 text-pink-500" />,
      title: 'MathJax Support',
      description: 'Beautiful mathematical expression rendering with LaTeX syntax',
    },
  ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`${
          isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
        } rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">What's New in v{version}</h2>
              <p className="text-blue-100 text-sm mt-1">
                We've added some exciting new features!
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="p-6 space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex gap-4 p-4 rounded-lg transition-colors ${
                isDark
                  ? 'bg-slate-700/50 hover:bg-slate-700'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex-shrink-0 mt-1">{feature.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p
                  className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* DraftView CTA Section */}
        <div className="px-6 pb-6">
          <div
            className={`p-5 rounded-lg border-2 ${
              isDark
                ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30'
                : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'} flex-shrink-0 mt-1`} />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Enjoying AsciiDoc Alive?
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Once your preview looks good, get it reviewed by stakeholders with DraftView. No GitHub account needed for reviewers.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://draftview.app"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>Try DraftView free</span>
              </a>
              <a
                href="https://github.com/gaurav-nelson/asciidocalive"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-900 text-white'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Star on GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-6 border-t ${
            isDark ? 'border-slate-700' : 'border-gray-200'
          } flex justify-end`}
        >
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsNewModal;


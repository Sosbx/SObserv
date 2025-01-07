import React, { useState, useEffect } from 'react';
import { Copy, RotateCcw } from 'lucide-react';

interface ReportAreaProps {
  report: string;
  onReportChange: (text: string) => void;
  onReset?: () => void;
}

const ReportArea: React.FC<ReportAreaProps> = ({ report, onReportChange, onReset }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [lastCopiedText, setLastCopiedText] = useState('');

  useEffect(() => {
    if (report !== lastCopiedText) {
      setIsCopied(false);
    }
  }, [report, lastCopiedText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setIsCopied(true);
      setLastCopiedText(report);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleReset = () => {
    onReportChange('');
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <textarea
        value={report}
        onChange={(e) => onReportChange(e.target.value)}
        className="w-full h-[calc(100vh-400px)] lg:h-[calc(100vh-300px)] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="Le texte généré apparaîtra ici. Vous pouvez modifier directement le texte..."
      />

      <div className="flex gap-4">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isCopied 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          <Copy className="h-4 w-4" />
          {isCopied ? 'Copié !' : 'Copier le rapport'}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default ReportArea;
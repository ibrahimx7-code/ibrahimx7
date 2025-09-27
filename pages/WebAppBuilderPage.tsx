import React, { useState } from 'react';
import { generateWebAppCode } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Download, Copy, Eye } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

const WebAppBuilderPage: React.FC = () => {
  const { t } = useTranslations();
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');

  const handleGenerate = async () => {
    if (!prompt) {
      setError(t('appBuilder.errorPrompt'));
      return;
    }
    setLoading(true);
    setError(null);
    setCode(null);
    try {
      const result = await generateWebAppCode(prompt, t('appBuilder.geminiInstruction'));
      setCode(result);
    } catch (err) {
      setError(t('appBuilder.errorGenerating'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (code) {
        navigator.clipboard.writeText(code);
        setCopyStatus(t('appBuilder.copySuccess'));
        setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const handleDownloadHtml = () => {
    if (code) {
      const blob = new Blob([code], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "ai-generated-app.html";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">{t('appBuilder.title')}</h2>
      <p className="text-lg text-gray-400 mb-8">{t('appBuilder.description')}</p>
      <div className="bg-base-200 p-6 rounded-lg shadow-lg mb-8">
        <label htmlFor="app-prompt" className="block text-lg font-medium text-gray-300 mb-2">{t('appBuilder.promptLabel')}</label>
        <textarea
          id="app-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('appBuilder.promptPlaceholder')}
          className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
          rows={4}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-300"
        >
          {loading ? t('appBuilder.generatingButton') : t('appBuilder.generateButton')}
        </button>
      </div>

      {error && <div className="my-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

      {loading && <LoadingSpinner message={t('appBuilder.loadingMessage')} />}

      {code && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">{t('appBuilder.resultCodeTitle')}</h3>
                <div className="flex gap-2">
                    <button onClick={handleCopy} title={t('appBuilder.copyTooltip')} className="p-2 bg-base-300 rounded-md hover:bg-gray-600 transition"><Copy size={16}/></button>
                    <button onClick={handleDownloadHtml} title={t('appBuilder.downloadTooltip')} className="p-2 bg-base-300 rounded-md hover:bg-gray-600 transition"><Download size={16}/></button>
                </div>
            </div>
             {copyStatus && <span className={`text-sm text-green-400 ${t('dir') === 'rtl' ? 'float-left' : 'float-right'}`}>{copyStatus}</span>}
            <div className="bg-base-300 rounded-lg p-4 h-96 overflow-auto">
              <pre><code className="text-sm font-mono">{code}</code></pre>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Eye size={20}/>{t('appBuilder.previewTitle')}</h3>
            <iframe
              srcDoc={code || ''}
              title="Preview"
              sandbox="allow-scripts"
              className="w-full h-96 bg-white border border-gray-600 rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebAppBuilderPage;

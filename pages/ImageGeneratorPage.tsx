import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslations } from '../hooks/useTranslations';

const ImageGeneratorPage: React.FC = () => {
  const { t } = useTranslations();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(t('imageGenerator.styles.realistic'));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = [
      t('imageGenerator.styles.anime'), 
      t('imageGenerator.styles.realistic'), 
      t('imageGenerator.styles.artistic'), 
      t('imageGenerator.styles.cinematic')
    ];

  const handleGenerate = async () => {
    if (!prompt) {
      setError(t('imageGenerator.errorPrompt'));
      return;
    }
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const fullPrompt = `${style} style, ${prompt}`;
      const url = await generateImage(fullPrompt);
      setImageUrl(url);
    } catch (err) {
      setError(t('imageGenerator.errorGenerating'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if(imageUrl) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ai-image-${Date.now()}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">{t('imageGenerator.title')}</h2>
      <div className="bg-base-200 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-lg font-medium text-gray-300 mb-2">{t('imageGenerator.promptLabel')}</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('imageGenerator.promptPlaceholder')}
            className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-300 mb-2">{t('imageGenerator.styleLabel')}</label>
          <div className="flex flex-wrap gap-3">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  style === s ? 'bg-indigo-600 text-white' : 'bg-base-300 hover:bg-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-300"
        >
          {loading ? t('imageGenerator.generatingButton') : t('imageGenerator.generateButton')}
        </button>
      </div>

      {error && <div className="mt-6 text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

      <div className="mt-8">
        {loading && <LoadingSpinner message={t('imageGenerator.loadingMessage')} />}
        {imageUrl && (
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-semibold mb-4">{t('imageGenerator.resultTitle')}</h3>
            <img src={imageUrl} alt={t('imageGenerator.resultAlt')} className="rounded-lg shadow-xl max-w-full lg:max-w-2xl" />
            <button
                onClick={handleDownload}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
                {t('imageGenerator.downloadButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGeneratorPage;

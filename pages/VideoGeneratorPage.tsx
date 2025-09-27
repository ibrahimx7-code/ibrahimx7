import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { useTranslations } from '../hooks/useTranslations';
import { Download, Film } from 'lucide-react';

const VideoGeneratorPage: React.FC = () => {
  const { t } = useTranslations();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(t('videoGenerator.styles.realistic'));
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(t('videoGenerator.loadingMessage'));

  const styles = [
      t('videoGenerator.styles.realistic'), 
      t('videoGenerator.styles.anime'), 
  ];

  // Effect to cycle through loading messages
  useEffect(() => {
    // FIX: The type for setInterval's return value in a browser is `number`, not `NodeJS.Timeout`.
    let intervalId: number;
    if (loading) {
      const messages = [
        t('videoGenerator.loadingMessage'),
        "تتم معالجة الإطارات الأولية...",
        "قد تستغرق هذه العملية بضع دقائق، شكرًا لصبرك.",
        "يتم الآن تجميع المشاهد النهائية..."
      ];
      let messageIndex = 0;
      setLoadingMessage(messages[messageIndex]);

      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 7000); // Change message every 7 seconds
    }
    return () => clearInterval(intervalId);
  }, [loading, t]);


  const handleGenerate = async () => {
    if (!prompt) {
      setError(t('videoGenerator.errorPrompt'));
      return;
    }
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    try {
      const fullPrompt = `${style} style, ${prompt}`;
      const url = await generateVideo(fullPrompt);
      setVideoUrl(url);
    } catch (err) {
      setError(t('videoGenerator.errorGenerating'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if(videoUrl) {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `ai-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // URL.revokeObjectURL(videoUrl); // Clean up the blob URL
    }
  };

  const LoadingState = () => (
    <div className="text-center bg-base-300 p-8 rounded-lg">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-400">{t('videoGenerator.loadingTitle')}</h3>
        <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Film size={40} className="text-indigo-400 animate-pulse" />
            </div>
        </div>
        <p className="text-lg text-gray-300 mb-2">{loadingMessage}</p>
        <p className="text-sm text-gray-500">{t('videoGenerator.loadingTip')}</p>
    </div>
  );


  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">{t('videoGenerator.title')}</h2>
      <div className="bg-base-200 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-lg font-medium text-gray-300 mb-2">{t('videoGenerator.promptLabel')}</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('videoGenerator.promptPlaceholder')}
            className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-300 mb-2">{t('videoGenerator.styleLabel')}</label>
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
          {loading ? t('videoGenerator.generatingButton') : t('videoGenerator.generateButton')}
        </button>
      </div>

      {error && <div className="mt-6 text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

      <div className="mt-8">
        {loading && <LoadingState />}
        {videoUrl && (
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-semibold mb-4">{t('videoGenerator.resultTitle')}</h3>
            <video src={videoUrl} controls className="rounded-lg shadow-xl max-w-full lg:max-w-2xl" />
            <button
                onClick={handleDownload}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex items-center gap-2"
            >
                <Download size={20} />
                {t('videoGenerator.download4kButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGeneratorPage;
import React, { useState, useRef } from 'react';
import { generateImageVariations } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Upload, Download, GalleryHorizontal } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

const fileToB64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

const VariationsGeneratorPage: React.FC = () => {
    const { t } = useTranslations();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const currentFile = files[0];
            setFile(currentFile);
            const reader = new FileReader();
            reader.onload = (e) => {
                setOriginalImage(e.target?.result as string);
                setGeneratedImages(null);
            };
            reader.readAsDataURL(currentFile);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleGenerate = async () => {
        if (!file) {
            setError(t('variationsGenerator.errorFile'));
            return;
        }
        setLoading(true);
        setError(null);
        setGeneratedImages(null);
        try {
            const base64Data = await fileToB64(file);
            const results = await generateImageVariations(base64Data, file.type, prompt, 4);
            setGeneratedImages(results);
        } catch (err) {
            setError(t('variationsGenerator.errorGenerating'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (imageUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `variation-${index + 1}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">{t('variationsGenerator.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-base-200 p-6 rounded-lg shadow-lg flex flex-col">
                    <h3 className="text-xl font-semibold mb-4">{t('variationsGenerator.step1')}</h3>
                    <div 
                        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition flex-grow flex items-center justify-center" 
                        onClick={triggerFileSelect}
                    >
                        {originalImage ? (
                            <img src={originalImage} alt={t('variationsGenerator.originalAlt')} className="max-h-64 mx-auto rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <Upload size={48} className="mb-4" />
                                <p>{t('variationsGenerator.uploadClick')}</p>
                                <p className="text-sm">{t('variationsGenerator.uploadDrag')}</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                    <div className="mt-6">
                        <label htmlFor="variation-prompt" className="block text-lg font-medium text-gray-300 mb-2">{t('variationsGenerator.step2')}</label>
                        <textarea
                            id="variation-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('variationsGenerator.promptPlaceholder')}
                            className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                            rows={2}
                            disabled={!originalImage}
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={loading || !originalImage}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center gap-2"
                    >
                        <GalleryHorizontal size={20} />
                        {loading ? t('variationsGenerator.generatingButton') : t('variationsGenerator.generateButton')}
                    </button>
                </div>

                <div className="bg-base-200 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[500px]">
                    <h3 className="text-xl font-semibold mb-4 self-start">{t('variationsGenerator.resultTitle')}</h3>
                    {loading && <LoadingSpinner message={t('variationsGenerator.loadingMessage')} />}
                    
                    {!loading && generatedImages && generatedImages.length > 0 && (
                        <div className="w-full grid grid-cols-2 gap-4">
                            {generatedImages.map((imgUrl, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={imgUrl} alt={`${t('variationsGenerator.variationAlt')} ${index + 1}`} className="rounded-lg shadow-md w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <button 
                                            onClick={() => handleDownload(imgUrl, index)} 
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded-full transition duration-300"
                                            title={t('variationsGenerator.downloadButton')}
                                        >
                                            <Download size={24}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && !generatedImages && (
                        <div className="text-gray-500 text-center flex-grow flex items-center justify-center">
                            <p>{t('variationsGenerator.resultPlaceholder')}</p>
                        </div>
                    )}
                </div>
            </div>
             {error && <div className="mt-6 text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}
        </div>
    );
};

export default VariationsGeneratorPage;

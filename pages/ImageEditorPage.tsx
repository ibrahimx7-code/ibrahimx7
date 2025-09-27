import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslations } from '../hooks/useTranslations';
import { Upload, Download, Wand2 } from 'lucide-react';

const fileToB64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

const ImageEditorPage: React.FC = () => {
    const { t } = useTranslations();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            setFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setOriginalImage(e.target?.result as string);
                setEditedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleEdit = async () => {
        if (!file || !prompt) {
            setError(t('imageEditor.errorPrompt'));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const base64Data = await fileToB64(file);
            const result = await editImage(base64Data, file.type, prompt);
            setEditedImage(result.imageUrl);
        } catch (err) {
            setError(t('imageEditor.errorEditing'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (editedImage) {
            const link = document.createElement('a');
            link.href = editedImage;
            link.download = `edited-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">{t('imageEditor.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">{t('imageEditor.step1')}</h3>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition" onClick={triggerFileSelect}>
                        {originalImage ? (
                            <img src={originalImage} alt={t('imageEditor.originalAlt')} className="max-h-64 mx-auto rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <Upload size={48} className="mb-4" />
                                <p>{t('imageEditor.uploadClick')}</p>
                                <p className="text-sm">{t('imageEditor.uploadDrag')}</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                    <div className="mt-6">
                        <label htmlFor="edit-prompt" className="block text-lg font-medium text-gray-300 mb-2">{t('imageEditor.step2')}</label>
                        <textarea
                            id="edit-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('imageEditor.promptPlaceholder')}
                            className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                            rows={3}
                            disabled={!originalImage}
                        />
                    </div>
                     <button
                        onClick={handleEdit}
                        disabled={loading || !originalImage || !prompt}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center gap-2"
                    >
                        <Wand2 size={20} />
                        {loading ? t('imageEditor.editingButton') : t('imageEditor.editButton')}
                    </button>
                </div>

                <div className="bg-base-200 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
                    <h3 className="text-xl font-semibold mb-4">{t('imageEditor.resultTitle')}</h3>
                    {loading && <LoadingSpinner message={t('imageEditor.loadingMessage')} />}
                    {!loading && editedImage && (
                        <>
                            <img src={editedImage} alt={t('imageEditor.editedAlt')} className="rounded-lg shadow-xl max-h-96" />
                            <button onClick={handleDownload} className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex items-center gap-2">
                                <Download size={20}/>
                                {t('imageEditor.download4kButton')}
                            </button>
                        </>
                    )}
                    {!loading && !editedImage && (
                        <div className="text-gray-500 text-center">
                            <p>{t('imageEditor.resultPlaceholder')}</p>
                        </div>
                    )}
                </div>
            </div>
             {error && <div className="mt-6 text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}
        </div>
    );
};

export default ImageEditorPage;

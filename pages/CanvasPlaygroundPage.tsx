import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';

const CanvasPlaygroundPage: React.FC = () => {
  const { t, language } = useTranslations();

  const defaultCode = `// ${t('canvas.welcome')}
// 'canvas' ${t('canvas.canvasVar')}
// 'ctx' ${t('canvas.ctxVar')}

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 70;

ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
ctx.fillStyle = '#6366f1'; // indigo-500
ctx.fill();
ctx.lineWidth = 5;
ctx.strokeStyle = '#a5b4fc'; // indigo-300
ctx.stroke();

ctx.fillStyle = 'white';
ctx.font = 'bold 24px ${language === 'ar' ? 'Tajawal' : 'Arial'}';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Canvas', centerX, centerY);
`;

  const [code, setCode] = useState(defaultCode);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Update code when language changes
  useEffect(() => {
    setCode(defaultCode);
  }, [language, t]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        try {
          // Execute user code
          // eslint-disable-next-line no-new-func
          const runCode = new Function('canvas', 'ctx', code);
          runCode(canvas, ctx);
          setError(null);
        } catch (e: any) {
            console.error(e);
            setError(`${t('canvas.error')} ${e.message}`);
        }
      }
    }
  }, [code, t]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">{t('canvas.title')}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">{t('canvas.editorTitle')}</h3>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-[500px] p-4 bg-base-300 border border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 ltr"
            spellCheck="false"
          />
        </div>
        <div className="flex flex-col">
            <h3 className="text-xl font-semibold mb-2">{t('canvas.previewTitle')}</h3>
            <canvas
              ref={canvasRef}
              width="500"
              height="500"
              className="bg-white border border-gray-600 rounded-lg w-full h-auto aspect-square"
            />
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 text-red-300 rounded-lg font-mono text-sm ltr">
                {error}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CanvasPlaygroundPage;

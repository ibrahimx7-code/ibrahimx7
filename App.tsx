import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ImageGeneratorPage from './pages/ImageGeneratorPage';
import ImageEditorPage from './pages/ImageEditorPage';
import WebAppBuilderPage from './pages/WebAppBuilderPage';
import AIChatPage from './pages/AIChatPage';
import VideoGeneratorPage from './pages/VideoGeneratorPage'; // Import new page
import LanguageSwitcher from './components/LanguageSwitcher';
import Header from './components/Header';
import { useTranslations } from './hooks/useTranslations';
import { Home, Bot, Image, Code, Edit3, Video } from 'lucide-react'; // Import Video icon
import LoadingSpinner from './components/LoadingSpinner';

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { t } = useTranslations();
    const navItems = [
        { path: '/', label: t('sidebar.home'), icon: <Home size={20} /> },
        { path: '/image-generator', label: t('sidebar.imageGenerator'), icon: <Image size={20} /> },
        { path: '/video-generator', label: t('sidebar.videoGenerator'), icon: <Video size={20} /> }, // Add new nav item
        { path: '/image-editor', label: t('sidebar.imageEditor'), icon: <Edit3 size={20} /> },
        { path: '/web-app-builder', label: t('sidebar.appBuilder'), icon: <Code size={20} /> },
        { path: '/ai-chat', label: t('sidebar.aiChat'), icon: <Bot size={20} /> },
    ];

    const { language } = useTranslations();
    const sidebarClasses = `
        w-64 bg-base-200 text-white p-4 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out
        ${language === 'ar' ? 'right-0' : 'left-0'}
        md:transform-none
        ${isOpen ? (language === 'ar' ? 'translate-x-0' : 'translate-x-0') : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
    `;

    return (
        <aside className={sidebarClasses}>
            <h1 className="text-2xl font-bold mb-4 text-indigo-400">{t('sidebar.title')}</h1>
            <div className="mb-8">
              <LanguageSwitcher />
            </div>
            <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${language === 'ar' ? 'space-x-reverse' : ''} ${
                                isActive ? 'bg-indigo-600 text-white' : 'hover:bg-base-300'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="mt-auto">
                <footer className="text-center text-gray-400 text-sm mt-4">
                    <p>{t('sidebar.developedBy')}</p>
                    <p className="font-semibold">ابراهيم</p>
                </footer>
            </div>
        </aside>
    );
};


const App: React.FC = () => {
  const { language, loadingTranslations } = useTranslations();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  if (loadingTranslations) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <LoadingSpinner message="جاري تحميل التطبيق..." />
      </div>
    );
  }

  const mainContentMargin = language === 'ar' ? 'md:mr-64' : 'md:ml-64';

  return (
    <HashRouter>
      <div className={`flex h-screen bg-base-100 text-white ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden"></div>}
        <main className={`flex-1 overflow-y-auto ${mainContentMargin} pt-16 md:pt-0`}>
           <div className="p-4 sm:p-8">
             <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/image-generator" element={<ImageGeneratorPage />} />
                <Route path="/video-generator" element={<VideoGeneratorPage />} /> {/* Add new route */}
                <Route path="/image-editor" element={<ImageEditorPage />} />
                <Route path="/web-app-builder" element={<WebAppBuilderPage />} />
                <Route path="/ai-chat" element={<AIChatPage />} />
             </Routes>
           </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
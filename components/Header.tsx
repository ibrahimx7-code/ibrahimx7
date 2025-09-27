
import React from 'react';
import { Menu } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { t } = useTranslations();

    return (
        <header className="fixed top-0 left-0 right-0 bg-base-200 p-4 border-b border-gray-700 md:hidden z-30">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-indigo-400">{t('sidebar.title')}</h1>
                <button onClick={onMenuClick} className="text-white">
                    <Menu size={28} />
                </button>
            </div>
        </header>
    );
};

export default Header;

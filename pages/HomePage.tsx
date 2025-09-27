import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Edit3, Code, Bot, Video } from 'lucide-react'; // Import Video icon
import { useTranslations } from '../hooks/useTranslations';

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, link }) => (
  <Link to={link} className="bg-base-200 p-6 rounded-lg shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 flex flex-col items-center text-center">
    <div className="text-indigo-400 mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </Link>
);

const HomePage: React.FC = () => {
  const { t } = useTranslations();

  const tools = [
    { icon: <Image size={40} />, title: t('home.tools.imageGenerator.title'), description: t('home.tools.imageGenerator.description'), link: '/image-generator' },
    { icon: <Video size={40} />, title: t('home.tools.videoGenerator.title'), description: t('home.tools.videoGenerator.description'), link: '/video-generator' }, // Add new tool
    { icon: <Edit3 size={40} />, title: t('home.tools.imageEditor.title'), description: t('home.tools.imageEditor.description'), link: '/image-editor' },
    { icon: <Code size={40} />, title: t('home.tools.appBuilder.title'), description: t('home.tools.appBuilder.description'), link: '/web-app-builder' },
    { icon: <Bot size={40} />, title: t('home.tools.aiChat.title'), description: t('home.tools.aiChat.description'), link: '/ai-chat' },
  ];

  return (
    <div className="animate-fade-in-up">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{t('home.title')}</h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">{t('home.subtitle')}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
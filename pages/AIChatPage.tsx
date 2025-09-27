import React, { useState, useEffect, useRef } from 'react';
import { startChat, sendMessageToChat } from '../services/geminiService';
import { Message } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';


const AIChatPage: React.FC = () => {
  const { t } = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
        startChat(t('aiChat.geminiInstruction'));
        setMessages([{ sender: 'bot', text: t('aiChat.welcomeMessage') }]);
        isInitialized.current = true;
    }
  }, [t]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    let fullBotResponse = '';
    // Use a placeholder with a unique key to avoid issues with React's reconciliation
    const placeholderKey = `bot-placeholder-${Date.now()}`;
    setMessages(prev => [...prev, { sender: 'bot', text: '...' }]);

    try {
      await sendMessageToChat(input, (chunk) => {
        fullBotResponse += chunk;
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.sender === 'bot') {
                 newMessages[newMessages.length - 1] = { sender: 'bot', text: fullBotResponse };
            }
            return newMessages;
        });
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { sender: 'bot', text: t('aiChat.error') };
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSend();
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)]">
      <h2 className="text-3xl font-bold mb-4">{t('aiChat.title')}</h2>
      <div className="flex-1 bg-base-200 rounded-lg shadow-lg p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 mb-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><Bot size={20} /></div>}
            <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'bot' ? 'bg-base-300' : 'bg-blue-700'}`}>
                <div className="prose prose-invert prose-p:my-0 prose-pre:bg-gray-900 prose-pre:p-2 prose-pre:rounded-md text-white">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
            </div>
             {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><User size={20} /></div>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('aiChat.inputPlaceholder')}
          className="flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-300"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AIChatPage;

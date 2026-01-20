import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const toggleLang = () => setLanguage(language === 'en' ? 'ru' : 'en');

  return (
    <div className="w-full bg-white/80 dark:bg-[#2C2F3A]/80 backdrop-blur-lg border-b border-gray-200 dark:border-neutral-medium/30">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="text-gray-900 dark:text-white font-bold text-xl">Habit & Budget</div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleLang} 
            className="icon-btn text-gray-600 dark:text-neutral-light hover:text-primary-purple" 
            title="Language"
          >
            {language === 'en' ? 'EN' : 'RU'}
          </button>
        </div>
      </div>
    </div>
  );
}




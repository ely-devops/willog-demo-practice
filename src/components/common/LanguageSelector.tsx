import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore, type Language } from '@/stores/useLanguageStore';

// Globe Icon (20x20) - Figma spec
const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.66667 10H18.3333" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 1.66667C12.0844 3.94863 13.2690 6.91003 13.3333 10C13.2690 13.09 12.0844 16.0514 10 18.3333C7.91561 16.0514 6.73104 13.09 6.66667 10C6.73104 6.91003 7.91561 3.94863 10 1.66667Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Chevron Down Icon (12x12) - Figma spec
const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Check Icon (16x16)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const languages: { code: Language; label: string }[] = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
];

export const LanguageSelector = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const currentLanguageLabel = t(`language.${language}`);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-9 cursor-pointer transition-colors text-gray-600 hover:text-gray-1000"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <GlobeIcon />
        <span className="text-label-m text-gray-1000">
          {currentLanguageLabel}
        </span>
        <ChevronDownIcon isOpen={isOpen} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 w-[8.75rem] bg-white border border-gray-300 rounded-[var(--radius-2)] shadow-lg overflow-hidden z-50"
          role="listbox"
          aria-label="Select language"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`
                flex items-center justify-between w-full px-3 py-2.5
                text-label-m text-left
                transition-colors
                ${language === lang.code
                  ? 'text-blue-500 bg-gray-100'
                  : 'text-gray-1000 hover:bg-gray-100'
                }
              `}
              role="option"
              aria-selected={language === lang.code}
            >
              <span>{lang.label}</span>
              {language === lang.code && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


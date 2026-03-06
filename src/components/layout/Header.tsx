import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { useLanguageStore, type Language } from '@/stores/useLanguageStore';
import { CURRENT_USER } from '@/utils/mockData';

// Icon imports
import languageIcon from '@/assets/header/language.svg';
import addAlertIcon from '@/assets/header/add_alert.svg';
import settingsIcon from '@/assets/header/settings.svg';
import slashIcon from '@/assets/common/slash.svg';

// Chevron Down Icon (12x12)
const ChevronDownSmallIcon = ({ className = '' }: { className?: string }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Check Icon for selected language
const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { currentCase } = useAppStore();
  const { language, setLanguage } = useLanguageStore();

  // Language dropdown state
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Language options
  const languageOptions: { value: Language; label: string }[] = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  // Dashboard 페이지 여부 확인
  const isDashboardPage = location.pathname.startsWith('/dashboard/');
  // Journey detail 페이지 여부 확인
  const isJourneyPage = location.pathname.startsWith('/journey/');
  // 등록 페이지 여부 확인
  const isRegisterPage = location.pathname.startsWith('/register');

  // 도메인별 대시보드 URL
  const getDashboardUrl = () => {
    return currentCase === 'bio' ? '/dashboard/lifesciences' : '/dashboard/hightech';
  };

  // 현재 페이지명 가져오기
  const getPageName = () => {
    if (isDashboardPage) return t('nav.dashboard', '대시보드');
    if (isJourneyPage) return t('nav.dashboard', '대시보드');
    if (location.pathname.startsWith('/register')) return t('nav.register', '등록');
    if (location.pathname.startsWith('/management')) return t('nav.management', '관리');
    if (location.pathname.startsWith('/intelligence')) return t('nav.intelligence', '데이터 인텔리전스');
    if (location.pathname.startsWith('/history')) return t('nav.history', '이력 추적');
    return t('nav.dashboard', '대시보드');
  };

  // 도메인 이름
  const getDomainName = () => {
    return t(`bizCase.${currentCase}`);
  };

  const currentLanguage = i18n.language === 'ko' ? '한국어' : 'English';

  return (
    <header className="bg-gray-50 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1">
        {isRegisterPage ? (
          <>
            {/* 등록: 대시보드 > 등록 (도메인 없이) */}
            <Link to={getDashboardUrl()} className="text-label-m text-gray-500 hover:text-gray-700">
              {t('nav.dashboard', '대시보드')}
            </Link>
            <img src={slashIcon} alt="" className="w-4 h-4" />
            <span className="text-label-m-strong text-gray-1000">{t('nav.registerData', '배송 데이터 등록')}</span>
          </>
        ) : isDashboardPage || isJourneyPage ? (
          <>
            {/* Dashboard or Journey: 대시보드 + 도메인명 */}
            <span className="text-label-m text-gray-500">{getPageName()}</span>
            <img src={slashIcon} alt="" className="w-4 h-4" />
            <span className="text-label-m-strong text-gray-1000">{getDomainName()}</span>
          </>
        ) : (
          <>
            {/* 기존: 페이지명 + 도메인명 */}
            <span className="text-label-m text-gray-500">{getPageName()}</span>
            <img src={slashIcon} alt="" className="w-4 h-4" />
            <span className="text-label-m-strong text-gray-1000">{getDomainName()}</span>
          </>
        )}
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Language Selector + Icons Group */}
        <div className="flex items-center gap-4">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              className="flex items-center gap-1.5 hover:bg-gray-100 rounded px-2 py-1.5 transition-colors"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              aria-expanded={isLangDropdownOpen}
              aria-haspopup="listbox"
            >
              <div className="flex items-center gap-1.5">
                <img src={languageIcon} alt="" className="w-5 h-5" />
                <span className="text-label-m text-gray-1000">{currentLanguage}</span>
              </div>
              <ChevronDownSmallIcon className={`text-gray-1000 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isLangDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-50"
                role="listbox"
                aria-label="Select language"
              >
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`w-full flex items-center justify-between px-3 py-2 text-label-m hover:bg-gray-50 transition-colors ${
                      language === option.value ? 'text-primary' : 'text-gray-800'
                    }`}
                    onClick={() => handleLanguageChange(option.value)}
                    role="option"
                    aria-selected={language === option.value}
                  >
                    <span>{option.label}</span>
                    {language === option.value && <CheckIcon className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2">
            {/* Alert Icon with Badge */}
            <button className="relative flex items-center justify-center w-9 h-9 bg-gray-50 rounded overflow-clip">
              <img src={addAlertIcon} alt="" className="w-5 h-5" />
              <span className="absolute right-0 top-0 min-w-4 h-4 px-1 bg-red-500 text-white text-[0.625rem] font-semibold tracking-[0.03125rem] flex items-center justify-center rounded-full border border-gray-50">
                3
              </span>
            </button>

            {/* Settings Icon */}
            <button className="flex items-center justify-center w-9 h-9 rounded-sm">
              <img src={settingsIcon} alt="" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 w-[11.25rem] h-9">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-[0.6875rem] font-semibold text-gray-600 tracking-[-0.01875rem]">{CURRENT_USER.initials}</span>
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-label-s-strong text-gray-1000 truncate">{CURRENT_USER.name}</span>
              <ChevronDownSmallIcon className="text-gray-1000" />
            </div>
            <span className="text-label-xs-strong text-gray-600 truncate">{CURRENT_USER.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

